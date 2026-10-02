#!/usr/bin/env python3
"""Refresh saved status-grouped coursework, TA history and projects from JSON."""
from pathlib import Path
import json, html, re
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
esc=lambda value: html.escape(str(value),quote=True)
def replace_block(target,name,content):
    text,count=re.subn(rf'<!-- {name}_START -->.*?<!-- {name}_END -->',lambda _:f'<!-- {name}_START -->\n{content}\n<!-- {name}_END -->',target.read_text(),flags=re.S)
    if count!=1:raise RuntimeError(f'Expected one {name} block in {target.name}')
    target.write_text(text)

record=json.loads((ROOT/'data/academics.json').read_text())
visible=[c for c in record['courses'] if c.get('profile_visible') is True]
degree=[c for c in visible if c.get('category')!='interest_only']
labels={'completed':'Completed','in_progress':'In progress','planned':'Planned'}
groups=[
    ('completed','COMPLETED','',[c for c in degree if c['status']=='completed'],''),
    ('in_progress','IN PROGRESS','Current registration',[c for c in degree if c['status']=='in_progress'],''),
    ('planned','PLANNED','Degree coursework',[c for c in degree if c['status']=='planned'],'Not confirmed registration.'),
    ('interest_only','BEYOND CURRICULUM','Interest-driven study',[c for c in visible if c.get('category')=='interest_only'],'Outside formal degree requirements. Planned interest-driven study is not confirmed registration.')
]
parts=[]
for index,(key,title,context,courses,note) in enumerate(groups):
    rows=[]
    for c in courses:
        grade=f"{c['grade']:.2f}" if c['status']=='completed' and c.get('grade') is not None else 'Pending'
        credits=c.get('credits');credits='Unknown' if credits is None else credits
        rows.append(f'<tr><td>{esc(c["title"])}</td><td>{esc(credits)}</td><td>{grade}</td><td>{labels[c["status"]]}</td></tr>')
    credit_sum=sum(c.get('credits') or 0 for c in courses)
    opened=' open' if index==0 else ''
    heading=f'<summary class="coursework-heading"><div><h2>{esc(title)}</h2><span class="coursework-context">{esc(context)}</span></div><div class="coursework-numbers"><span>{len(courses)} courses</span><span>{credit_sum:g} credits</span></div></summary>'
    table='<table class="coursework-table"><thead><tr><th scope="col">Course</th><th scope="col">Credits</th><th scope="col">Grade</th><th scope="col">Status</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>' if courses else '<p class="coursework-empty">No coursework recorded.</p>'
    tail='<p class="coursework-note">'+esc(note)+'</p>' if note else ''
    parts.append(f'<details class="coursework-section" data-group="{key}"{opened}>{heading}{table}{tail}</details>')
replace_block(ROOT/'academics/index.html','COURSE_FALLBACK','\n'.join(parts))
teaching=record.get('teaching_assistant',{})
replace_block(ROOT/'academics/index.html','TA_HISTORY',' · '.join(esc(c) for c in teaching.get('courses',[])))
p=ROOT/'academics/index.html';meta=' · '.join([teaching.get('institution',''),' - '.join(filter(None,[teaching.get('start'),teaching.get('end')]))]).strip(' · ')
s,count=re.subn(r'(<span id="ta-meta">).*?(</span>)',lambda m:m[1]+esc(meta)+m[2],p.read_text(),count=1,flags=re.S)
if count!=1:raise RuntimeError('Missing TA metadata element')
p.write_text(s)
projects=json.loads((ROOT/'data/projects.json').read_text())['projects'];parts=[]
for index,project in enumerate(projects,1):
    if urlparse(project['url']).scheme!='https':raise ValueError('Project URLs must use https')
    parts.append(f'<article class="project-row"><span class="project-index mono" aria-hidden="true">{index:02d}</span><div><h3><a href="{esc(project["url"])}" target="_blank" rel="noopener noreferrer">{esc(project["title"])} <span aria-hidden="true">↗</span></a></h3><p>{esc(project["description"])}</p></div></article>')
replace_block(ROOT/'industry/index.html','PROJECTS','\n'.join(parts))
print(f'Refreshed {len(visible)} visible courses, TA history and {len(projects)} projects.')
