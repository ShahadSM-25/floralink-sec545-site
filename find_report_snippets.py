from docx import Document
from pathlib import Path

path = Path('/home/ubuntu/upload/FloraLink_Final_Report_اساسي.docx')
doc = Document(str(path))
for i, p in enumerate(doc.paragraphs):
    text = ' '.join(p.text.split())
    if 'MIT-02' in text or 'MIT-13' in text or 'Rate Limiting' in text or 'CAPTCHA' in text or 'working prototype' in text or 'current prototype' in text or 'centres on the FloraLink authentication flow' in text or 'centers on the FloraLink authentication flow' in text:
        print(f'{i}: {text}')
