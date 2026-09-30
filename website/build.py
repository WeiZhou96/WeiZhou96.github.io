"""Build the standalone academic website. Python 3 standard library only."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parent
SITE = ROOT / 'site'
P = json.loads((ROOT / 'content/profile.json').read_text(encoding='utf-8'))
PUBS = json.loads((ROOT / 'content/publications.json').read_text(encoding='utf-8'))
E = lambda value: escape(str(value), quote=True)

def bib(p):
    if p.get('type') == 'conference':
        fields = {'title': '{' + p['title'] + '}', 'author': ' and '.join(p['authors']), 'booktitle': p['venue'], 'year': p['year']}
        return '@inproceedings{' + p['id'] + ',\n' + ',\n'.join('  ' + k + ' = {' + str(v) + '}' for k, v in fields.items() if v) + '\n}'
    fields = {'title': '{' + p['title'] + '}', 'author': ' and '.join(p['authors']), 'journal': p['venue'], 'year': p['year'], 'volume': p['volume'], 'number': p['issue'], 'pages': p['pages'].replace('-', '--'), 'doi': p['doi']}
    return '@article{' + p['id'] + ',\n' + ',\n'.join('  ' + k + ' = {' + str(v) + '}' for k, v in fields.items() if v) + '\n}'

def publication(p):
    authors = ', '.join('<strong>Wei Zhou</strong>' if a == 'Wei Zhou' else E(a) for a in p['authors'])
    conf = p.get('type') == 'conference'
    meta = E(p['volume']) + (f"({E(p['issue'])})" if p['issue'] else '')
    if p['pages']: meta += ': ' + E(p['pages'])
    meta += ', ' + str(p['year'])
    link = f"https://doi.org/{E(p['doi'])}" if p['doi'] else E(p.get('url', ''))
    title_html = f'<a href="{link}">{E(p["title"])}</a>' if link else E(p['title'])
    paper_link = f'<a href="{link}">Paper ↗</a>' if link else ''
    venue_html = f'<em>{E(p["venue"])}</em> ({p["year"]}).' if conf else f'<em>{E(p["venue"])}</em>, {meta}.'
    year = '2026<small>online</small>' if p['group'].startswith('2026 ·') else E(p['year'])
    note = f'<p class="pub-note">{E(p["note"])}</p>' if p['note'] else ''
    preprint = f'<a href="{E(p["preprint"])}">Preprint ↗</a>' if p.get('preprint') else ''
    searchable = ' '.join([p['title'], *p['authors'], p['venue'], p['topic'], p['doi']]).lower()
    tags = ('<span class="tag-conf">Conference</span>' if conf else '') + f'<span>{E(p["topic"])}</span>' + ('<span class="tag-survey">Survey</span>' if 'survey' in p['title'].lower() else '')
    return f'''<li class="publication" data-publication data-year="{E(p['group'])}" data-topic="{E(p['topic'])}" data-search="{E(searchable)}">
      <div class="pub-year">{year}</div><article>
      <p class="pub-tags">{tags}</p>
      <h3 class="pub-title">{title_html}</h3>
      <p class="authors">{authors}</p><p class="venue">{venue_html}</p>{note}
      <div class="pub-links">{paper_link}{preprint}<details><summary>BibTeX</summary><div class="bib-panel"><pre>{E(bib(p))}</pre><button class="small-button" data-copy-bib hidden type="button">Copy BibTeX</button></div></details></div>
      </article></li>'''

def section(title, content, ident='', more=''):
    return f'<section class="section"{f" id={E(ident)}" if ident else ""}><div class="section-heading"><h2>{title}</h2>{more}</div>{content}</section>'

def timeline(items):
    return '<ul class="timeline">' + ''.join(f'<li><time>{E(x["date"])}</time><div><h3>{E(x["title"])}</h3><p>{E(x["text"])}</p></div></li>' for x in items) + '</ul>'

def services():
    return '<ul class="service-list">' + ''.join(f'<li>{E(x["journal"])}<small>{E(x["role"])}</small></li>' for x in P['service']) + '</ul>'

def layout(page, title, description, body):
    nav = ''.join(f'<a href="{url}"{chr(32)+"aria-current=page" if key == page else ""}>{label}</a>' for key, url, label in [('home','index.html','Home'),('publications','publications.html','Publications'),('cv','cv.html','CV'),('join','join.html','Join')])
    structured = {'@context':'https://schema.org','@type':'Person','name':P['name'],'alternateName':P['chinese_name'],'jobTitle':P['role'],'email':P['email'],'affiliation':{'@type':'CollegeOrUniversity','name':P['university']},'sameAs':[P['faculty_url'],P['scholar_url'],P['orcid_url']]}
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)} · Wei Zhou</title><meta name="description" content="{E(description)}">
<meta name="theme-color" content="#173c59"><meta property="og:title" content="{E(title)} · Wei Zhou"><meta property="og:description" content="{E(description)}"><meta property="og:type" content="website">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/style.css"><script src="assets/site.js" defer></script>
<script type="application/ld+json">{json.dumps(structured,ensure_ascii=False)}</script></head>
<body id="top"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="wrap"><div class="nav-row"><a class="brand" href="index.html">Wei Zhou <span lang="zh-CN">周威</span></a><nav class="site-nav" aria-label="Main navigation">{nav}</nav></div></div></header>
<main class="wrap" id="main">{body}</main>
<div class="wrap"><footer class="footer"><p>© 2026 Wei Zhou · Nanjing, China<br><a href="mailto:{P['email']}">{P['email']}</a></p><p>Updated {P['updated']}<br><a href="{P['faculty_url']}">NJUST faculty profile ↗</a></p></footer></div></body></html>'''

socials = f'''<div class="socials"><a href="mailto:{P['email']}">Email</a><a href="{P['scholar_url']}">Google Scholar ↗</a><a href="{P['orcid_url']}">ORCID ↗</a><a href="{P['github_url']}">GitHub ↗</a><a href="{P['researchgate_url']}">ResearchGate ↗</a></div>'''
hero = f'''<section class="hero" aria-label="About Wei Zhou"><div class="hero-copy"><p class="eyebrow">NJUST · School of Automation</p><h1>Wei Zhou <span class="cn" lang="zh-CN">周威</span></h1><p class="role">Associate Professor</p><p class="affiliation">School of Automation<br>Nanjing University of Science and Technology</p><p class="bio">{E(P['intro'])}</p><p class="bio">{E(P['background'])}</p>{socials}</div><figure class="portrait"><img src="assets/portrait.png" alt="Portrait of Wei Zhou" width="186" height="246" fetchpriority="high"><figcaption>Nanjing, China<a href="{P['faculty_url']}">University profile ↗</a></figcaption></figure></section>'''
research = '<div class="research-list">' + ''.join(f'<article class="research-item"><span class="research-index">0{i+1}</span><h3>{E(r["title"])}</h3><p>{E(r["text"])}</p></article>' for i,r in enumerate(P['research'])) + '</div>'
news = '<ul class="news-list">' + ''.join(f'<li><time>{E(n["date"])}</time><p>{E(n["text"])} <a href="{E(n["url"])}">{E(n["label"])} ↗</a></p></li>' for n in P['news']) + '</ul>'
selected = sorted([p for p in PUBS if p['featured']],key=lambda p:(bool(p.get('pin')),p['year'],p['doi']),reverse=True)
home = hero + '<aside class="invitation"><p><strong>Prospective students.</strong> I welcome students interested in robotics, computer vision, and multimodal learning.</p><a href="join.html">Working with me →</a></aside>'
home += section('Research interests',research,'research') + section('News',news,'news')
home += section('Selected publications','<ul class="pub-list">'+''.join(publication(p) for p in selected)+'</ul>','selected-publications','<a href="publications.html">Browse publications →</a>')
home += '<div class="two-col">' + section('Academic service','<p style="font-size:14px">Editorial and young editorial board service for journals in intelligent vehicles, robotics, and transportation.</p><a style="font-size:13px" href="cv.html#service">Service &amp; experience →</a>') + section('Beyond research','<p style="font-size:14px">I share ideas and practical resources on visual perception and intelligent transportation through <em>Deep Traffic</em>, my WeChat public account.</p><a style="font-size:13px" href="join.html#contact">Get in touch →</a>') + '</div>'
(SITE/'index.html').write_text(layout('home','Home','Wei Zhou is an Associate Professor at NJUST working on embodied intelligence, computer vision, and multimodal foundation models.',home),encoding='utf-8')

groups=sorted(set(p['group'] for p in PUBS),reverse=True)
topics=sorted(set(p['topic'] for p in PUBS))
filters=f'''<div class="filters" hidden><div class="filter-field search"><label for="paper-search">Search publications</label><input id="paper-search" type="search" placeholder="Title, author, journal, or keyword…" autocomplete="off"></div><div class="filter-field"><label for="paper-year">Year</label><select id="paper-year"><option value="">All years</option>{''.join(f'<option>{E(g)}</option>' for g in groups)}</select></div><div class="filter-field"><label for="paper-topic">Research area</label><select id="paper-topic"><option value="">All areas</option>{''.join(f'<option>{E(t)}</option>' for t in topics)}</select></div><button id="reset-filters" class="small-button" type="button">Reset</button></div>'''
papers=f'''<header class="page-intro"><p class="eyebrow">Research</p><h1>Publications</h1><p>Selected work in visual perception, intelligent transportation, and robotics. My name is highlighted in the author lists.</p><div class="page-actions"><a href="{P['scholar_url']}">Full list on Google Scholar ↗</a><a href="publications.bib" download>Download BibTeX ↓</a></div></header>{filters}<p class="result-count" id="result-count" aria-live="polite">{len(PUBS)} publications</p><ul class="pub-list">{''.join(publication(p) for p in PUBS)}</ul><p id="no-results" class="empty-state" hidden>No publications match these filters. Try another keyword or reset the filters.</p><p class="back-top"><a href="#top">Back to top ↑</a></p>'''
(SITE/'publications.html').write_text(layout('publications','Publications','Selected publications by Wei Zhou, with DOI links and BibTeX citations.',papers),encoding='utf-8')
(SITE/'publications.bib').write_text('\n\n'.join(bib(p) for p in PUBS)+'\n',encoding='utf-8')

cv=f'''<header class="page-intro"><p class="eyebrow">Background &amp; experience</p><h1>Curriculum vitae</h1><div class="print-name">Wei Zhou · Associate Professor, NJUST · {P['email']}</div><p>Associate Professor, School of Automation<br>Nanjing University of Science and Technology</p><div class="page-actions"><button type="button" id="print-cv" class="small-button" hidden>Print / Save as PDF</button><a href="{P['faculty_url']}">University profile ↗</a></div></header>'''
cv+=section('Academic appointment',timeline(P['appointments']))+section('Education',timeline(P['education']))+section('Selected research funding',timeline(P['grants']))+section('Academic service',services(),'service')
cv+=section('Selected reviewing service','<p style="font-size:14px">IEEE Transactions on Intelligent Transportation Systems; IEEE Transactions on Intelligent Vehicles; IEEE Transactions on Industrial Informatics; IEEE Transactions on Vehicular Technology; Advanced Engineering Informatics; Neural Networks.</p>')
cv+=section('Honors &amp; awards',timeline(P['awards']))+section('Selected publications','<ul class="pub-list">'+''.join(publication(p) for p in selected[:4])+'</ul>')
(SITE/'cv.html').write_text(layout('cv','CV','Academic appointments, education, research funding, service, and awards of Wei Zhou.',cv),encoding='utf-8')

join=f'''<header class="page-intro"><p class="eyebrow">Students &amp; collaborators</p><h1>Working with me</h1><p>Research in embodied intelligence, visual perception, and multimodal learning at NJUST.</p></header><div class="prose"><h2>Prospective students</h2><p>I welcome inquiries from prospective graduate students with a background in automation, computer science, or a related field. Undergraduate students interested in gaining research experience are also welcome to contact me.</p><p>My current interests include visual perception for robots, multimodal foundation models, and intelligent transportation. For examples of my work, please see the <a href="publications.html">publications page</a>.</p><h2>Get in touch</h2><p>If you are interested in working with me, please email a brief introduction, your CV, and a few sentences about your research interests. Links to previous projects, code, or papers are helpful if available.</p><p>Graduate admissions follow the university’s current policies and schedule. Please consult the <a href="{P['faculty_url']}">NJUST faculty profile</a> for recruitment information.</p><section class="contact-block" id="contact"><h2>Contact</h2><p><a class="email" href="mailto:{P['email']}">{P['email']}</a></p><p>School of Automation<br>Nanjing University of Science and Technology<br>Nanjing, China</p></section><h2 lang="zh-CN">致感兴趣的同学</h2><p class="cn-note" lang="zh-CN">欢迎对具身智能、计算机视觉与多模态大模型感兴趣的同学联系，也欢迎本科生参与科研。来信请简要介绍学习背景、研究兴趣和已有项目经历，并附个人简历。研究生招生以学校当年政策和实际招生安排为准。</p></div>'''
(SITE/'join.html').write_text(layout('join','Working with me','Contact Wei Zhou about research opportunities in robotics, computer vision, and multimodal learning at NJUST.',join),encoding='utf-8')
(SITE/'404.html').write_text(layout('','Page not found','The requested page could not be found.','<header class="page-intro"><p class="eyebrow">404</p><h1>Page not found</h1><p>The page may have moved. <a href="index.html">Return to the homepage →</a></p></header>'),encoding='utf-8')
print(f'Built 5 pages and {len(PUBS)} publication citations in {SITE}')
