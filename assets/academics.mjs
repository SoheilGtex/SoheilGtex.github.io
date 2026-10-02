import {validateRecord,summarize,groupCourses,courseworkLayout,STATUS_LABELS,displayRecord,creditTotal,workingSummary,evaluatedGpa} from './academic-model.mjs';

const $ = id => document.getElementById(id);
const create = (tag,className,text) => {
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text != null) node.textContent=text;
  return node;
};
const formatGrade = grade => typeof grade === 'number' ? grade.toFixed(2) : 'Not recorded';
const numericText = value => value == null ? 'Not recorded' : String(value);
let record, view;

function courseDetails(course) {
  const fragment=document.createDocumentFragment();
  fragment.append(create('h3','',course.title));
  if(course.title_fa){const title=create('p','course-fa',course.title_fa);title.lang='fa';title.dir='rtl';fragment.append(title);}
  const metadata=[['Status',STATUS_LABELS[course.status]]];
  if(course.code)metadata.push(['Code',course.code]);
  if(course.credits != null)metadata.push(['Credits',course.credits]);
  if(course.status==='completed' && course.grade != null)metadata.push(['Grade',formatGrade(course.grade)+' / 20']);
  if(course.academic_year)metadata.push(['Academic year',course.academic_year]);
  if(course.category)metadata.push(['Category',record.categories?.[course.category] || course.category]);
  if(course.instructor)metadata.push(['Instructor',course.instructor]);
  const dl=create('dl');
  metadata.forEach(([key,value])=>{const row=create('div');row.append(create('dt','',key),create('dd','',String(value)));dl.append(row);});
  fragment.append(dl);
  if(record.prerequisite_data_status==='verified' && course.prerequisites?.length){const block=create('div','detail-prerequisites');block.append(create('p','','Documented prerequisites'));const list=create('ul');course.prerequisites.map(id=>view.courses.find(c=>c.id===id)).filter(Boolean).forEach(c=>list.append(create('li','',c.title)));block.append(list);fragment.append(block);}
  if(course.note)fragment.append(create('p','detail-note',course.note));
  return fragment;
}
function selectCourse(id) {
  const course=record.courses.find(c=>c.id===id);
  document.querySelectorAll('.course-node').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  document.querySelectorAll('.course-edge').forEach(p=>p.classList.toggle('selected',p.dataset.from===id||p.dataset.to===id));
  const detail=$('course-detail');
  detail.replaceChildren(create('p','eyebrow','COURSE DETAIL'),courseDetails(course));
  if(matchMedia('(max-width:660px)').matches)detail.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
function renderMap() {
  const layout=courseworkLayout(view), container=$('course-map');
  container.style.width=layout.width+'px';container.style.height=layout.height+'px';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs'),marker=document.createElementNS(ns,'marker');
  for(const [k,v] of Object.entries({id:'prerequisite-arrow',markerWidth:7,markerHeight:7,refX:6,refY:3.5,orient:'auto',markerUnits:'userSpaceOnUse'}))marker.setAttribute(k,v);
  const arrow=document.createElementNS(ns,'path');arrow.setAttribute('d','M0 0L7 3.5L0 7');arrow.setAttribute('class','course-arrow');marker.append(arrow);defs.append(marker);svg.append(defs);
  layout.edges.forEach(edge=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',edge.path);p.setAttribute('class','course-edge');p.setAttribute('marker-end','url(#prerequisite-arrow)');p.dataset.from=edge.from;p.dataset.to=edge.to;svg.append(p);});
  container.append(svg);
  layout.columns.forEach(({group,x})=>{const label=create('div','course-column-label',group.title);const context=group.key==='in_progress'?`${group.context} · ${creditTotal(group.courses)} credits`:group.context;label.append(create('small','',context));label.style.left=x+'px';container.append(label);});
  layout.nodes.forEach(({course,x,y,width,height})=>{
    const button=create('button','course-node');button.type='button';button.style.left=x+'px';button.style.top=y+'px';button.style.width=width+'px';button.style.minHeight=height+'px';button.dataset.status=course.status;button.dataset.category=course.category || '';button.dataset.id=course.id;button.setAttribute('aria-pressed','false');
    const state=course.status==='completed'?`${formatGrade(course.grade)} / 20`:(STATUS_LABELS[course.status].toUpperCase()+(course.credits!=null?' · '+course.credits+' CR':''));
    button.append(create('span','node-title',course.title),create('span','node-state',state));
    button.setAttribute('aria-label',`${course.title}, ${STATUS_LABELS[course.status]}${course.status==='completed'&&course.grade!=null?', grade '+formatGrade(course.grade)+' out of 20':''}. Show course details.`);
    button.addEventListener('click',()=>selectCourse(course.id));
    // All nodes are keyboard reachable; arrow keys provide spatial navigation as well.
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();
      const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      const candidates=layout.nodes.filter(n=>n!==layout.nodes.find(n=>n.course.id===course.id)&&((n.x-x)*direction[0]+(n.y-y)*direction[1])>0);
      candidates.sort((a,b)=>{
        const score=n=>Math.hypot(n.x-x,n.y-y)+Math.abs((n.x-x)*direction[1]-(n.y-y)*direction[0])*2;
        return score(a)-score(b);
      });
      if(candidates[0])document.querySelector(`.course-node[data-id="${candidates[0].course.id}"]`).focus();
    });
    container.append(button);
  });
  if(layout.edges.length)$('map-evidence-note').textContent='Arrows connect documented prerequisites to their dependent courses. Select a course to highlight its immediate dependencies.';
}
function showCourseDetail(course,section,trigger) {
  section.querySelector('.coursework-inline-detail')?.remove();
  const detail=create('div','coursework-inline-detail');detail.tabIndex=-1;detail.setAttribute('role','region');detail.setAttribute('aria-label',course.title+' details');
  const close=create('button','detail-close','Close ×');close.type='button';close.addEventListener('click',()=>{detail.remove();trigger.focus();});
  detail.append(close,courseDetails(course));section.append(detail);detail.focus({preventScroll:true});
  detail.addEventListener('keydown',e=>{if(e.key==='Escape'){detail.remove();trigger.focus();}});
}
function renderCoursework() {
  const parent=$('coursework-record');
  groupCourses(view).forEach((group,index)=>{
    const section=create('details','coursework-section'),heading=create('summary','coursework-heading'),title=create('div');
    section.open=index===0;section.dataset.group=group.key;
    title.append(create('h2','',group.title),create('span','coursework-context',group.context));heading.append(title);
    const stats=create('div','coursework-numbers');
    stats.append(create('span','',`${group.courses.length} courses`),create('span','',`${creditTotal(group.courses)} credits`));
    heading.append(stats);section.append(heading);
    if(!group.courses.length){section.append(create('p','coursework-empty','No coursework recorded.'));parent.append(section);return;}
    const table=create('table','coursework-table'),thead=create('thead'),tr=create('tr');
    ['Course','Credits','Grade','Status'].forEach(t=>{const th=create('th','',t);th.scope='col';tr.append(th);});thead.append(tr);table.append(thead);
    const tbody=create('tbody');
    group.courses.forEach(course=>{
      const row=create('tr'),name=create('td'),button=create('button','coursework-course-button',course.title);button.type='button';button.addEventListener('click',()=>showCourseDetail(course,section,button));name.append(button);
      const credits=create('td','',course.credits==null?'Unknown':numericText(course.credits));
      const grade=create('td','',course.status==='completed'&&course.grade!=null?formatGrade(course.grade):'Pending');
      const status=create('td','course-status-label',STATUS_LABELS[course.status]);row.append(name,credits,grade,status);tbody.append(row);
    });
    table.append(tbody);section.append(table);
    if(group.note)section.append(create('p','coursework-note',group.note));parent.append(section);
  });
}
function initTabs() {
  const tabs=[$('tab-map'),$('tab-list')],panels=[$('map-panel'),$('list-panel')];
  function activate(index,focus=false) {
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(index));
    tab.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();activate(event.key==='Home'?0:event.key==='End'?1:1-index,true);}
    });
  });
  $('academic-tabs').hidden=false;$('list-panel').setAttribute('role','tabpanel');$('list-panel').setAttribute('aria-labelledby','tab-list');activate(matchMedia('(max-width:660px)').matches?1:0);
}
async function initialize() {
  try {
    const response=await fetch(new URL('../data/academics.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw new Error('Academic data could not be loaded.');
    record=validateRecord(await response.json());
    view=displayRecord(record);
    if(record.record_as_of && /^\d{4}-\d{2}-\d{2}$/.test(record.record_as_of)) {
      const date=new Date(record.record_as_of+'T00:00:00Z');
      $('record-evidence-date').textContent='Record updated: '+new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
    }
    const summary=summarize(view.courses),working=workingSummary(record);
    const cumulative=typeof record.reported_cumulative_gpa==='number'?record.reported_cumulative_gpa:working.gpa;
    const gpa=$('overall-gpa');gpa.replaceChildren(document.createTextNode(cumulative==null?'Not available':cumulative.toFixed(2)));
    if(cumulative!=null)gpa.append(create('span','gpa-denominator','/ 20'));
    const relevant=$('relevant-gpa');
    relevant.replaceChildren(document.createTextNode(summary.gpa==null?'Not available':summary.gpa.toFixed(2)));
    if(summary.gpa!=null)relevant.append(create('span','gpa-denominator','/ 20'));
    const evaluated=evaluatedGpa(record),evaluation=$('evaluated-gpa');
    if(evaluated){evaluation.textContent=`Externally evaluated GPA: ${evaluated.value.toFixed(2)} / 4.00 · Method: ${evaluated.method}`+(evaluated.note?' · '+evaluated.note:'');evaluation.hidden=false;}
    const teaching=record.teaching_assistant;
    if(teaching && Array.isArray(teaching.courses)){
      $('ta-course-list').textContent=teaching.courses.join(' · ');
      $('ta-meta').textContent=[teaching.institution,[teaching.start,teaching.end].filter(Boolean).join(' - ')].filter(Boolean).join(' · ');
    }
    $('completed-credits').textContent=String(record.total_passed_credits ?? summary.completedCredits);
    renderMap();renderCoursework();initTabs();$('static-record').hidden=true;
    document.documentElement.dataset.academicReady='true';
  } catch(error) {
    // Network, module, or data failures leave a complete readable static record.
    const message=$('data-message');message.hidden=false;message.textContent='Live calculations are unavailable. The saved course record remains available below.';
    $('map-panel').hidden=true;$('academic-tabs').hidden=true;$('static-record').hidden=false;$('list-panel').hidden=false;$('coursework-record').replaceChildren();
    $('overall-gpa').textContent='See saved record';$('relevant-gpa').textContent='See saved record';$('completed-credits').textContent='See course record';
    console.warn('Academic enhancement unavailable:',error.message);
  }
}
initialize();
