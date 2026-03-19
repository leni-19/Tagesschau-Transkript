import os
import sys
import time
import logging
import requests
import yt_dlp
import google.generativeai as genai
import resend
from xml.etree import ElementTree as ET
import json

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Credentials
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
EMAIL_RECIPIENT = os.environ.get("EMAIL_RECIPIENT")

if not GEMINI_API_KEY:
    logging.error("Missing GEMINI_API_KEY. Ensure it is set in GitHub Secrets.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

PLAYLIST_ID = "PL4A2F331EE86DCC22"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?playlist_id={PLAYLIST_ID}"

def get_latest_video():
    logging.info(f"Fetching latest video from playlist {PLAYLIST_ID}")
    response = requests.get(RSS_URL)
    if response.status_code != 200:
        logging.error("Failed to fetch YouTube RSS feed")
        return None
        
    root = ET.fromstring(response.content)
    ns = {
        'yt': 'http://www.youtube.com/xml/schemas/2015',
        'atom': 'http://www.w3.org/2005/Atom'
    }
    
    entries = root.findall('atom:entry', ns)
    if not entries:
        logging.error("No entries found in playlist")
        return None
        
    latest = entries[0]
    video_id = latest.find('yt:videoId', ns).text
    title = latest.find('atom:title', ns).text
    published = latest.find('atom:published', ns).text
    
    return {"video_id": video_id, "title": title, "published_at": published}

def is_already_processed(published_at):
    date_str = published_at.split("T")[0]
    paths = [f"Website/transkripte/{date_str}.html", f"transkripte/{date_str}.html"]
    for p in paths:
        if os.path.exists(p):
            return True
    return False

def download_video(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    output_filename = f"{video_id}.mp4"
    logging.info(f"Downloading video {url} via yt-dlp...")
    
    ydl_opts = {
        'format': 'best[ext=mp4][height<=480]/best',
        'outtmpl': output_filename,
        'quiet': False
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
        
    return output_filename

def process_with_gemini(filepath):
    logging.info(f"Uploading {filepath} to Gemini File API...")
    video_file = genai.upload_file(path=filepath)
    logging.info(f"Uploaded as {video_file.uri}. Waiting for processing...")
    
    while video_file.state.name == "PROCESSING":
        logging.info("Still processing...")
        time.sleep(10)
        video_file = genai.get_file(video_file.name)
        
    if video_file.state.name == "FAILED":
        raise ValueError("Video processing failed in Gemini API.")
        
    logging.info("Video is READY. Triggering generation...")

    model = genai.GenerativeModel(model_name="models/gemini-3.1-flash-lite-preview")

    prompt = """
Erstelle basierend auf diesem Tagesschau-Video eine detaillierte Zusammenfassung.
WICHTIG: Deine Antwort muss genau EIN gültiges JSON-Objekt sein, absolut ohne Markdown-Blöcke (kein ```json) oder Backticks rundherum. Gib wirklich nur den reinen, rohen JSON-Text zurück.

Extrahiere genau diese zwei Variablen (Keys):
1. "visual_description": Eine übergreifende Bildbeschreibung des Videos (1-2 kurze Absätze).
2. "transcript_html": Das vollständige, inhaltliche Text-Protokoll beziehungsweise die detaillierte inhaltliche Zusammenfassung der gesamten Sendung. Jeder Sprecher oder Sinnabschnitt muss in ein <p> Tag gewrappt sein. Nutze auch <strong> für wichtige Themen-Überschriften im Text.

Beispiel-Format (exakt so):
{
  "visual_description": "Susanne Daubner steht im blauen Studio...",
  "transcript_html": "<p><strong>Außenpolitik:</strong> Guten Abend, meine Damen und Herren.</p><p>Das Wetter...</p>"
}
    """
    
    response = model.generate_content([video_file, prompt], request_options={"timeout": 600})
    logging.info("Gemini responded successfully!")
    
    genai.delete_file(video_file.name)
    logging.info("Deleted video file from Gemini Storage.")
    
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        data = json.loads(text)
        return data
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse JSON from Gemini: {text}")
        raise e

def save_to_html(title, published_at, visual_description, transcript_html):
    logging.info("Saving to HTML file...")
    date_str = published_at.split("T")[0]
    
    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
</head>
<body>
    <header>
        <div class="container">
            <h1>{title}</h1>
        </div>
    </header>
    <main class="container">
        <section class="image-description">
            <h2>Bildbeschreibung</h2>
            <p>{visual_description}</p>
        </section>
        <section class="transcript-box">
            <h2>Wörtliches Protokoll</h2>
            <div class="transcript-text">
{transcript_html}
            </div>
        </section>
    </main>
</body>
</html>"""
    
    target_dir = "Website/transkripte"
    if not os.path.exists("Website"):
        target_dir = "transkripte"
        
    os.makedirs(target_dir, exist_ok=True)
    filename = f"{target_dir}/{date_str}.html"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
    logging.info(f"Saved beautifully formatted HTML successfully to {filename}.")

def send_email_notification(title):
    if not RESEND_API_KEY or not EMAIL_RECIPIENT:
        return
    logging.info("Sending email via Resend...")

    html_content = f"<h2>Neues KI-Transkript online: {title}</h2>" \
                   f"<p>Die neueste Ausgabe der Tagesschau wurde soeben von Gemini vollständig analysiert und das HTML-Transkript in dein Dashboard integriert!</p>" \
                   f"<br><br><p>Es sollte in ein paar Minuten auf Vercel veröffentlicht sein.</p>"
                   
    try:
        r = resend.Emails.send({
            "from": "Tagesschau KI <onboarding@resend.dev>",
            "to": EMAIL_RECIPIENT,
            "subject": f"Neu verarbeitet: {title}",
            "html": html_content
        })
        logging.info(f"Email sent: {r}")
    except Exception as e:
        logging.error(f"Email error: {e}")

def main():
    latest = get_latest_video()
    if not latest:
        return
        
    video_id = latest["video_id"]
    
    if is_already_processed(latest["published_at"]):
        logging.info(f"Transcript for {latest['published_at']} already exists. Exiting cleanly.")
        return
        
    filepath = None
    try:
        filepath = download_video(video_id)
        data = process_with_gemini(filepath)
        
        save_to_html(
            title=latest["title"], 
            published_at=latest["published_at"], 
            visual_description=data.get("visual_description", ""), 
            transcript_html=data.get("transcript_html", "")
        )
        
        send_email_notification(latest["title"])
        
    except Exception as e:
        logging.error(f"Workflow failed: {e}")
        sys.exit(1)
    finally:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
            logging.info(f"Cleaned up local file {filepath}")

if __name__ == "__main__":
    main()
