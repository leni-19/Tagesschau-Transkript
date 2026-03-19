import fs from 'fs/promises';
import path from 'path';

export interface Transcript {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  imageDescription: string;
}

export async function getTranscripts(): Promise<Transcript[]> {
  const transkripteDir = path.join(process.cwd(), 'transkripte');
  
  try {
    const files = await fs.readdir(transkripteDir);
    const htmlFiles = files.filter(f => f.endsWith('.html') && !f.includes('index.html'));
    
    const transcripts = await Promise.all(
      htmlFiles.map(async (file) => {
        const filePath = path.join(transkripteDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const id = file.replace('.html', '');
        
        const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : `Tagesschau ${id}`;
        
        const textMatch = content.match(/<div class="transcript-text">([\s\S]*?)<\/div>/);
        let excerpt = '';
        if (textMatch) {
            const plainText = textMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            excerpt = plainText.substring(0, 160) + '...';
        }

        const imgDescMatch = content.match(/<h2>Bildbeschreibung<\/h2>\s*<p>(.*?)<\/p>/);
        const imageDescription = imgDescMatch ? imgDescMatch[1] : '';

        return {
          id,
          date: id,
          title,
          excerpt,
          imageDescription
        };
      })
    );
    
    return transcripts.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error reading transkripte directory:', error);
    return [];
  }
}

export async function getTranscriptById(id: string) {
    const filePath = path.join(process.cwd(), 'transkripte', `${id}.html`);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : `Tagesschau ${id}`;
        
        const textMatch = content.match(/<div class="transcript-text">([\s\S]*?)<\/div>/);
        const transcriptHtml = textMatch ? textMatch[1] : '';

        const imgDescMatch = content.match(/<h2>Bildbeschreibung<\/h2>\s*<p>(.*?)<\/p>/);
        const imageDescription = imgDescMatch ? imgDescMatch[1] : '';

        return {
            id,
            date: id,
            title,
            transcriptHtml,
            imageDescription
        };
    } catch {
        return null;
    }
}
