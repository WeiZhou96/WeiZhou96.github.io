"""Check the publishable artifact using the Python standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parent / 'dist'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.refs, self.ids, self.base = [], set(), None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag == 'base':
            self.base = attrs.get('href')
        elif tag in ('a', 'link', 'script', 'img'):
            ref = attrs.get('href') or attrs.get('src')
            if ref:
                self.refs.append(ref)

pages = {path: Page(path.read_text(encoding='utf-8')) for path in ROOT.rglob('*.html')}
assert ROOT / 'index.html' in pages, 'Missing homepage'
checked = 0
for path, page in pages.items():
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        base = ROOT if page.base == '/' or url.path.startswith('/') else path.parent
        target = (base / unquote(url.path).lstrip('/')).resolve() if url.path else path
        assert target.is_relative_to(ROOT), (path, ref)
        if target.is_dir():
            target /= 'index.html'
        assert target.is_file(), (path, ref)
        if url.fragment and target.suffix == '.html':
            assert unquote(url.fragment) in pages[target].ids, (path, ref)
        checked += 1
for path in ROOT.rglob('*.css'):
    for ref in re.findall(r'url\([\"\']?([^\"\')]+)', path.read_text(encoding='utf-8')):
        if not urlsplit(ref).scheme:
            assert (path.parent / ref).is_file(), (path, ref)
            checked += 1
assert 'classic-link' not in (ROOT / 'index.html').read_text(encoding='utf-8')
assert len(list(ROOT.rglob('clawd-spritesheet.webp'))) == 1
assert not list(ROOT.rglob('*.md')), 'Maintenance notes must not be published'
print(f'PASS: {len(pages)} pages and {checked} local references; deployment assets are complete.')
