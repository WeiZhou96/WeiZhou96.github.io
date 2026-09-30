"""Build the expressive design alongside the preserved classic site."""
from pathlib import Path
from html import escape as e
import json

ROOT=Path(__file__).resolve().parent
VENUES=['NeurIPS','ACM Computing Surveys','IEEE Trans. Industrial Informatics','IEEE Trans. Intelligent Transportation Systems','IEEE Trans. Intelligent Vehicles','Robotics and Computer-Integrated Manufacturing','Advanced Engineering Informatics','Automation in Construction','Engineering Applications of AI']
SITE=ROOT/'site'
OUT=SITE/'expressive'
OUT.mkdir(exist_ok=True)
P=json.loads((ROOT/'content/profile.json').read_text(encoding='utf-8'))

SCALE_JS='<script>(function(){var d=document.documentElement;function f(){var w=innerWidth,h=innerHeight,z=1;if(w>=1500){z=Math.max(1,Math.min(3,Math.round(Math.min(w/1440,h/820)*100)/100));}d.style.setProperty("--page-zoom",z);d.style.setProperty("--wrap-max",Math.max(1296,Math.min(w/z-160,1700))+"px");d.classList.toggle("is-scaled",z>1.02)}var t;function g(){f();clearTimeout(t);t=setTimeout(f,120)}f();addEventListener("resize",g);addEventListener("orientationchange",g);if(window.visualViewport)visualViewport.addEventListener("resize",g);var pw=innerWidth,ph=innerHeight;setInterval(function(){if(innerWidth!==pw||innerHeight!==ph){pw=innerWidth;ph=innerHeight;f()}},300)})()</script>'

def convert(text,home=False):
    text=text.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')
    text=text.replace('href="publications.bib"','href="../publications.bib"')
    text=text.replace('<link rel="icon"',SCALE_JS+'<link rel="icon"',1)
    text=text.replace('</head>','<link rel="stylesheet" href="expressive.css"><link rel="stylesheet" href="polish.css"><script src="expressive.js" defer></script><script src="polish.js" defer></script><script src="starfield.js" defer></script></head>')
    text=text.replace('<body id="top">','<body id="top" class="expressive'+(' home' if home else '')+'"><div class="global-orbit" aria-hidden="true"><canvas id="star-canvas"></canvas><canvas id="orbital-canvas"></canvas><div class="orbit-veil"></div></div><div class="reading-progress" aria-hidden="true"></div>')
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
<a class="hero-badge" href="#news"><span class="pulse" aria-hidden="true"></span><strong>NeurIPS 2026</strong><span>CARVE accepted</span><span class="arrow" aria-hidden="true">→</span></a>
<div class="hero-actions"><a class="primary-link" href="publications.html">Explore my research <span>↗</span></a><a class="secondary-link" href="mailto:{P['email']}">Let’s connect ↗</a></div></div>
<div class="visual-space has-clawd"><div class="orb-label top-label">PERCEPTION / LEARNING / ACTION</div><div class="orb-label bottom-label">COMPUTER VISION &amp; ROBOTICS</div>
<section class="clawd-console" aria-label="A greeting from Wei Zhou, typed by Clawd"><div class="clawd-caption"><span><span class="clawd-dot"></span> A LITTLE HELLO</span><button class="clawd-replay" type="button" aria-label="Replay Clawd’s introduction" hidden>Replay ↻</button></div><div class="clawd-stage"><div class="clawd-sprite" role="img" aria-label="Clawd typing on a keyboard"></div></div><div class="clawd-message" aria-hidden="true"><span class="clawd-prompt">&gt;</span><span class="clawd-typed">Hi, I’m Wei Zhou.
I work on vision, robotics,
and multimodal AI.</span><span class="clawd-cursor"></span></div><p class="visually-hidden">Hi, I’m Wei Zhou. I work on vision, robotics, and multimodal AI. Helping machines see, understand, and act. One idea at a time.</p><div class="clawd-bottom"><span>CLAWD AT THE KEYBOARD</span><span class="clawd-state">HELLO, WORLD</span></div></section>
<figure class="portrait-note"><img src="../assets/portrait.png" width="93" height="115" alt="Portrait of Wei Zhou"><figcaption><strong>Wei Zhou <span lang="zh-CN">周威</span></strong><span>School of Automation</span><span>Nanjing, China</span><a href="{P['faculty_url']}">University profile ↗</a></figcaption></figure></div>
<div class="hero-bottom"><span>RESEARCH WITH A REAL-WORLD PERSPECTIVE</span><a href="#about">Scroll to explore <span>↓</span></a></div></section>
<section id="about" class="about-strip"><div><span class="micro-label">01 / ABOUT</span><h2>Intelligence beyond<br><em>the screen.</em></h2></div><div><p>{e(P['intro'])}</p><p class="subtle">{e(P['background'])}</p><div class="socials"><a href="{P['scholar_url']}">Google Scholar ↗</a><a href="{P['orcid_url']}">ORCID ↗</a><a href="{P['github_url']}">GitHub ↗</a><a href="{P['researchgate_url']}">ResearchGate ↗</a></div></div></section>
'''
ICONS=['<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="14" width="26" height="20" rx="6"/><path d="M24 14V8M20 8h8"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M19 30h10M6 22v6M42 22v6"/></svg>','<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 24c6-10 13-15 20-15s14 5 20 15c-6 10-13 15-20 15S10 34 4 24z"/><circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="2.4"/></svg>','<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 42 19 6M34 42 29 6"/><path d="M24 10v6M24 22v6M24 34v6"/></svg>']
stats=f'''<section class="stats-strip" aria-label="Research at a glance"><div class="stat"><span class="stat-num" data-count="60" data-suffix="+">60+</span><span class="stat-label">Papers in the past five years</span></div><div class="stat"><span class="stat-num" data-count="{len(P['grants'])}">{len(P['grants'])}</span><span class="stat-label">Research projects as principal investigator</span></div><div class="stat"><span class="stat-num" data-count="{len(P['service'])}">{len(P['service'])}</span><span class="stat-label">Journal editorial board roles</span></div></section>
<div class="venue-marquee" role="group" aria-label="Venues where my work has appeared"><span class="marquee-label">PUBLISHED IN</span><div class="marquee-window"><ul class="marquee-track">{''.join('<li>'+v+'</li>' for v in VENUES*2)}</ul></div></div>
'''
text=classic[:start]+hero+classic[end:]
text=text.replace('<section id="about"',stats+'<section id="about"') if '<section id="about"' in text else text
text=text.replace('<section id=about',stats+'<section id=about') if stats not in text else text
for i,icon in enumerate(ICONS):
    text=text.replace(f'<span class="research-index">0{i+1}</span>',f'<span class="research-icon">{icon}</span><span class="research-index">0{i+1}</span>')
text=text.replace('<ul class="news-list"><li>','<ul class="news-list"><li class="is-featured">',1)
text=text.replace('Research interests','Research directions').replace('<h2>News</h2>','<h2>From the lab<span class="heading-aside">NEWS &amp; MILESTONES</span></h2>')
text=text.replace('<div class="two-col">','<aside class="join-banner"><div><span class="micro-label">LET’S BUILD WHAT’S NEXT</span><h2>Curious minds welcome.</h2><p>Interested in robotics, vision, or multimodal learning?</p></div><a href="join.html">Work with me <span>↗</span></a></aside><div class="two-col">')
(OUT/'index.html').write_text(convert(text,True),encoding='utf-8')
for name in ['publications.html','cv.html','join.html','404.html']:
    (OUT/name).write_text(convert((SITE/name).read_text(encoding='utf-8')),encoding='utf-8')
print('Expressive design built:',OUT)
