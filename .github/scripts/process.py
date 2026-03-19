import os, sys, time, logging, requests, yt_dlp, resend, json
import google.generativeai as genai
from xml.etree import ElementTree as ET

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
EMAIL_RECIPIENT = os.environ.get("EMAIL_RECIPIENT")

if not GEMINI_API_KEY:
    logging.error("Missing GEMINI_API_KEY.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
if RESEND_API_KEY: resend.api_key = RESEND_API_KEY

PLAYLIST_ID = "PL4A2F331EE86DCC22"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?playlist_id={PLAYLIST_ID}"

def get_latest_video():
    response = requests.get(RSS_URL)
    if response.status_code != 200: return None
    root = ET.fromstring(response.content)
    ns = {'yt': 'http://www.youtube.com/xml/schemas/2015', 'atom': 'http://www.w3.org/2005/Atom'}
    entries = root.findall('atom:entry', ns)
    if not entries: return None
    latest = entries[0]
    return {
        "video_id": latest.find('yt:videoId', ns).text,
        "title": latest.find('atom:title', ns).text,
        "published_at": latest.find('atom:published', ns).text
    }

def is_already_processed(published_at):
    date_str = published_at.split("T")[0]
    paths = [f"Website/transkripte/{date_str}.html", f"transkripte/{date_str}.html"]
    for p in paths:
        if os.path.exists(p): return True
    return False

def download_video(video_id):
    y_opts = {'format': 'best[ext=mp4][height<=480]/best', 'outtmpl': f"{video_id}.mp4", 'quiet': False}
    with yt_dlp.YoutubeDL(y_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
    return f"{video_id}.mp4"

def process_with_gemini(filepath):
    video_file = genai.upload_file(path=filepath)
    while video_file.state.name == "PROCESSING":
        time.sleep(10)
        video_file = genai.get_file(video_file.name)
        
    model = genai.GenerativeModel(model_name="models/gemini-3.1-flash-lite-preview")
    prompt = """
Erstelle basierend auf diesem Tagesschau-Video eine detaillierte Zusammenfassung. Mache genau EIN JSON-Objekt ohne Markdown:
{
  "visual_description": "Bildbeschreibung hier...",
  "transcript_html": "<p>Sinnabschnitt 1</p><p>Sinnabschnitt 2</p>"
}
    """
    response = model.generate_content([video_file, prompt], request_options={"timeout": 600})
    genai.delete_file(video_file.name)
    
    text = response.text.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return json.loads(text.strip())

def save_to_html(title, published_at, visual_description, transcript_html):
    date_str = published_at.split("T")[0]
    html = f"""<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>{title}</title></head>
<body>
    <header><h1>{title}</h1></header>
    <main>
        <section class="image-description">
            <h2>Bildbeschreibung</h2><p>{visual_description}</p>
        </section>
        <section class="transcript-box">
            <h2>Wörtliches Protokoll</h2><div class="transcript-text">{transcript_html}</div>
        </section>
    </main>
</body></html>"""
    
    target_dir = "Website/transkripte" if os.path.exists("Website") else "transkripte"
    os.makedirs(target_dir, exist_ok=True)
    with open(f"{target_dir}/{date_str}.html", "w", encoding="utf-8") as f:
        f.write(html)

def main():
    latest = get_latest_video()
    if not latest or is_already_processed(latest["published_at"]): return
    
    filepath = None
    try:
        filepath = download_video(latest["video_id"])
        data = process_with_gemini(filepath)
        save_to_html(latest["title"], latest["published_at"], data.get("visual_description", ""), data.get("transcript_html", ""))
    except Exception as e:
        logging.error(f"Failed: {e}")
        sys.exit(1)
    finally:
        if filepath and os.path.exists(filepath): os.remove(filepath)

if __name__ == "__main__":
    main()
