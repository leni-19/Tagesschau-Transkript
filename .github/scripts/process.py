import os, sys, logging, requests, resend, json
import google.generativeai as genai
from xml.etree import ElementTree as ET
from youtube_transcript_api import YouTubeTranscriptApi

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

def get_transcript_text(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['de'])
        return " ".join([t['text'] for t in transcript])
    except Exception as e:
        logging.error(f"Failed to fetch transcript: {e}")
        return None

def process_with_gemini(raw_text):
    model = genai.GenerativeModel(model_name="models/gemini-3.1-flash-lite-preview")
    prompt = f"""
Erstelle aus dem folgenden rohen Tagesschau-Transkript ein gut lesbares, sauberes HTML-Protokoll.
WICHTIG: Deine Antwort muss genau EIN gültiges JSON-Objekt sein, absolut ohne Markdown-Blöcke (kein ```json).

Extrahiere genau diese Variable:
1. "transcript_html": Das vollständige inhaltliche Text-Protokoll der Sendung. Jeder Sprecher oder Sinnabschnitt muss in ein <p> Tag gewrappt sein. Nutze <strong> für wichtige Themen-Überschriften im Text.

Beispiel-Format:
{{
  "transcript_html": "<p><strong>Außenpolitik:</strong> Guten Abend.</p><p>Das Wetter...</p>"
}}

Hier ist das Rohtranskript:
{raw_text}
    """
    response = model.generate_content(prompt, request_options={"timeout": 60})
    
    text = response.text.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    return json.loads(text.strip())

def save_to_html(title, published_at, transcript_html):
    date_str = published_at.split("T")[0]
    html = f"""<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>{title}</title></head>
<body>
    <header><h1>{title}</h1></header>
    <main>
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
    
    video_id = latest["video_id"]
    raw_text = get_transcript_text(video_id)
    if not raw_text:
        logging.error("No transcript available.")
        sys.exit(1)
        
    try:
        data = process_with_gemini(raw_text)
        save_to_html(latest["title"], latest["published_at"], data.get("transcript_html", ""))
    except Exception as e:
        logging.error(f"Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
