"""Build the expressive website at the deployment root (Python standard library only)."""
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
for script in ('build.py', 'build_expressive.py'):
    subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / script)], check=True)
OUT.mkdir(exist_ok=True)
shutil.copytree(ROOT / 'site/assets', OUT / 'assets', dirs_exist_ok=True)
shutil.copy2(ROOT / 'site/publications.bib', OUT / 'publications.bib')
for source in (ROOT / 'site/expressive').iterdir():
    if source.suffix not in ('.html', '.css', '.js'):
        continue
    text = source.read_text(encoding='utf-8').replace('../assets/', 'assets/')
    text = text.replace('../publications.bib', 'publications.bib')
    text = text.replace('<a class="classic-link" href="../index.html">Classic ↗</a>', '')
    # GitHub serves the same 404 document for nested unknown paths.
    if source.name == '404.html':
        text = text.replace('<head>', '<head><base href="/">', 1)
    (OUT / source.name).write_text(text, encoding='utf-8')
(OUT / '.nojekyll').touch()
for route in ('publications', 'cv'):
    folder = OUT / route
    folder.mkdir(exist_ok=True)
    (folder / 'index.html').write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
        f'<meta http-equiv="refresh" content="0;url=../{route}.html">'
        f'<title>Wei Zhou</title></head><body><a href="../{route}.html">'
        f'Continue to {route}</a></body></html>', encoding='utf-8')
print(f'Publish directory: {OUT}')
