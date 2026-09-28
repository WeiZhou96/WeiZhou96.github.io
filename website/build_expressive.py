"""Build the expressive design alongside the preserved classic site."""
from pathlib import Path
from html import escape as e
import json

ROOT=Path(__file__).resolve().parent
SITE=ROOT/'site'
OUT=SITE/'expressive'
OUT.mkdir(exist_ok=True)
P=json.loads((ROOT/'content/profile.json').read_text(encoding='utf-8'))

def convert(text,home=False):
    text=text.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')
    text=text.replace('href="publications.bib"','href="../publications.bib"')
    text=text.replace('</head>','<link rel="stylesheet" href="expressive.css"><script src="expressive.js" defer></script></head>')
    text=text.replace('<body id="top">','<body id="top" class="expressive'+(' home' if home else '')+'"><div class="global-orbit" aria-hidden="true"><canvas id="orbital-canvas"></canvas><div class="orbit-veil"></div></div><div class="reading-progress" aria-hidden="true"></div>')
    text=text.replace('Wei Zhou <span lang="zh-CN">周威</span></a><nav','<span class="brand-mark">w.</span> Wei Zhou</a><nav')
    text=text.replace('</nav>','<a class="classic-link" href="../index.html">Classic ↗</a><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion</button></nav>')
    text=text.replace('#173c59','#0b101b')
    if home:
        text=text.replace('</head>','<script src="clawd.js" defer></script></head>')
    return text

classic=(SITE/'index.html').read_text(encoding='utf-8')
start=classic.index('<section class="hero"')
end=classic.index('<section class="section" id=research')
hero=f'''<section class="art-hero" aria-label="About Wei Zhou">
<div class="hero-text"><p class="eyebrow"><span class="status-dot"></span> ASSOCIATE PROFESSOR · NJUST</p>
<h1>Wei<span class="name-last">Zhou<span class="name-cn" lang="zh-CN">周威</span></span></h1>
<p class="hero-statement">Seeing the world.<br><em>Learning to act.</em></p>
<p class="hero-summary">Embodied intelligence, computer vision &amp;<br class="desktop-break"> multimodal foundation models.</p>
<div class="hero-actions"><a class="primary-link" href="publications.html">Explore my research <span>↗</span></a><a class="secondary-link" href="mailto:{P['email']}">Let’s connect ↗</a></div></div>
<div class="visual-space has-clawd"><div class="orb-label top-label">PERCEPTION / LEARNING / ACTION</div><div class="orb-label bottom-label">COMPUTER VISION &amp; ROBOTICS</div>
<section class="clawd-console" aria-label="A greeting from Wei Zhou, typed by Clawd"><div class="clawd-caption"><span><span class="clawd-dot"></span> A LITTLE HELLO</span><button class="clawd-replay" type="button" aria-label="Replay Clawd’s introduction" hidden>Replay ↻</button></div><div class="clawd-stage"><div class="clawd-sprite" role="img" aria-label="Clawd typing on a keyboard"></div></div><div class="clawd-message" aria-hidden="true"><span class="clawd-prompt">&gt;</span><span class="clawd-typed">Hi, I’m Wei Zhou.
I work on vision, robotics,
and multimodal AI.</span><span class="clawd-cursor"></span></div><p class="visually-hidden">Hi, I’m Wei Zhou. I work on vision, robotics, and multimodal AI. Helping machines see, understand, and act. One idea at a time.</p><div class="clawd-bottom"><span>CLAWD AT THE KEYBOARD</span><span class="clawd-state">HELLO, WORLD</span></div></section>
<figure class="portrait-note"><img src="../assets/portrait.png" width="93" height="115" alt="Portrait of Wei Zhou"><figcaption><strong>Wei Zhou <span lang="zh-CN">周威</span></strong><span>School of Automation</span><span>Nanjing, China</span><a href="{P['faculty_url']}">University profile ↗</a></figcaption></figure></div>
<div class="hero-bottom"><span>RESEARCH WITH A REAL-WORLD PERSPECTIVE</span><a href="#about">Scroll to explore <span>↓</span></a></div></section>
<section id="about" class="about-strip"><div><span class="micro-label">01 / ABOUT</span><h2>Intelligence beyond<br><em>the screen.</em></h2></div><div><p>{e(P['intro'])}</p><p class="subtle">{e(P['background'])}</p><div class="socials"><a href="{P['scholar_url']}">Google Scholar ↗</a><a href="{P['orcid_url']}">ORCID ↗</a><a href="{P['github_url']}">GitHub ↗</a><a href="{P['researchgate_url']}">ResearchGate ↗</a></div></div></section>
'''
text=classic[:start]+hero+classic[end:]
text=text.replace('Research interests','Research directions').replace('<h2>News</h2>','<h2>From the lab<span class="heading-aside">NEWS &amp; MILESTONES</span></h2>')
text=text.replace('<div class="two-col">','<aside class="join-banner"><div><span class="micro-label">LET’S BUILD WHAT’S NEXT</span><h2>Curious minds welcome.</h2><p>Interested in robotics, vision, or multimodal learning?</p></div><a href="join.html">Work with me <span>↗</span></a></aside><div class="two-col">')
(OUT/'index.html').write_text(convert(text,True),encoding='utf-8')
for name in ['publications.html','cv.html','join.html','404.html']:
    (OUT/name).write_text(convert((SITE/name).read_text(encoding='utf-8')),encoding='utf-8')
print('Expressive design built:',OUT)
