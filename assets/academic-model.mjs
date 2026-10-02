// Pure academic calculations. No DOM, dependencies, or hardcoded totals.
export const STATUSES = Object.freeze(['completed','in_progress','planned']);
export const STATUS_LABELS = Object.freeze({completed:'Completed',in_progress:'In progress',planned:'Planned'});
export function displayedCourses(record) {
  return record.courses.filter(c => c.profile_visible === true);
}
export function displayRecord(record) {
  return {...record, courses:displayedCourses(record)};
}
const validCredits = credits => typeof credits === 'number' && Number.isFinite(credits) && credits > 0;
export function creditTotal(courses) {
  return courses.reduce((sum,c) => sum + (validCredits(c.credits) ? c.credits : 0),0);
}
export function workingSummary(record) {
  return summarize(record.courses.filter(c => c.category !== 'interest_only'));
}
export function evaluatedGpa(record) {
  const gpa=record.gpa_4;
  return gpa && typeof gpa.value === 'number' && Number.isFinite(gpa.value) && gpa.value >= 0 && gpa.value <= 4 && typeof gpa.method === 'string' && gpa.method.trim() ? gpa : null;
}
export function isGradedCompleted(course, scale = 20) {
  return course.status === 'completed' && validCredits(course.credits) &&
    typeof course.grade === 'number' && Number.isFinite(course.grade) && course.grade >= 0 && course.grade <= scale;
}
export function summarize(courses, {scale = 20, category = null} = {}) {
  const selected = category ? courses.filter(c => c.category === category) : courses;
  let weighted = 0, gradedCredits = 0, completedCredits = 0;
  for (const course of selected) {
    if (course.status === 'completed' && validCredits(course.credits)) completedCredits += course.credits;
    if (isGradedCompleted(course, scale)) {
      weighted += course.grade * course.credits;
      gradedCredits += course.credits;
    }
  }
  return {gpa:gradedCredits ? weighted / gradedCredits : null,gradedCredits,completedCredits};
}
export function validateRecord(record) {
  if (!record || !Array.isArray(record.courses)) throw new Error('The academic record must contain a courses array.');
  if (record.gpa_scale !== 20) throw new Error('This record uses the 20-point grading scale.');
  const ids = new Set();
  for (const course of record.courses) {
    if (!course || typeof course.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(course.id) || ids.has(course.id)) throw new Error('Every course requires a unique, URL-safe id.');
    ids.add(course.id);
    if (typeof course.title !== 'string' || !course.title.trim()) throw new Error(`Missing title: ${course.id}`);
    if (typeof course.profile_visible !== 'boolean') throw new Error(`Explicit profile visibility is required: ${course.id}`);
    if (!STATUSES.includes(course.status)) throw new Error(`Unknown course status: ${course.id}`);
    if (course.credits != null && !validCredits(course.credits)) throw new Error(`Invalid credits: ${course.id}`);
    if (course.grade != null && (typeof course.grade !== 'number' || !Number.isFinite(course.grade) || course.grade < 0 || course.grade > 20)) throw new Error(`Invalid grade: ${course.id}`);
    if (course.semester != null && (!Number.isInteger(course.semester) || course.semester < 1)) throw new Error(`Invalid semester: ${course.id}`);
    if (course.prerequisites != null && !Array.isArray(course.prerequisites)) throw new Error(`Prerequisites must be an array: ${course.id}`);
  }
  for (const course of record.courses) {
    const local = new Set();
    for (const prerequisite of course.prerequisites || []) {
      if (!ids.has(prerequisite) || prerequisite === course.id || local.has(prerequisite)) throw new Error(`Invalid prerequisite: ${course.id}`);
      local.add(prerequisite);
    }
  }
  // A dependency graph must be acyclic. Invalid data falls back to the static record.
  const byId = new Map(record.courses.map(c => [c.id,c]));
  const visited = new Set(), active = new Set();
  function visit(id) {
    if (active.has(id)) throw new Error('Prerequisite cycle in academic record.');
    if (visited.has(id)) return;
    active.add(id);
    for (const p of byId.get(id).prerequisites || []) visit(p);
    active.delete(id); visited.add(id);
  }
  ids.forEach(visit);
  return record;
}
export function groupCourses(record) {
  const visible=displayedCourses(record),degree=visible.filter(c => c.category !== 'interest_only');
  return [
    {key:'completed',title:'COMPLETED',context:'',note:'',courses:degree.filter(c => c.status === 'completed')},
    {key:'in_progress',title:'IN PROGRESS',context:'Current registration',note:'',courses:degree.filter(c => c.status === 'in_progress')},
    {key:'planned',title:'PLANNED',context:'Degree coursework',note:'Not confirmed registration.',courses:degree.filter(c => c.status === 'planned')},
    {key:'interest_only',title:'BEYOND CURRICULUM',context:'Interest-driven study',note:'Outside formal degree requirements. Planned interest-driven study is not confirmed registration.',courses:visible.filter(c => c.category === 'interest_only')}
  ];
}
export function courseworkLayout(record) {
  const groups=groupCourses(record),nodes=[],columns=[];
  const columnWidth=240,rowHeight=82,top=69,nodeWidth=204,nodeHeight=66;
  let offset=0, maxRows=0;
  for(const group of groups) {
    // One column per status/category group; vertical scrolling holds longer records.
    const count=1;
    const rows=Math.max(1,group.courses.length);
    columns.push({group,x:offset,width:count*columnWidth});
    group.courses.forEach((course,i)=>{
      const col=Math.floor(i/rows),row=i%rows;
      nodes.push({course,x:offset+col*columnWidth+4,y:top+row*rowHeight,width:nodeWidth,height:nodeHeight});
    });
    offset += count*columnWidth;
    maxRows=Math.max(maxRows,rows);
  }
  const byId=new Map(nodes.map(n=>[n.course.id,n]));
  const edges=[];
  if(record.prerequisite_data_status === 'verified') for(const node of nodes) for(const prerequisite of node.course.prerequisites || []) {
    const from=byId.get(prerequisite);
    if (!from) continue; // An excluded general course must not reappear through an edge.
    const x1=from.x+from.width,y1=from.y+from.height/2,x2=node.x,y2=node.y+node.height/2;
    const bend=Math.max(30,Math.abs(x2-x1)*.42);
    // Source is the prerequisite; the arrowhead belongs to the dependent course.
    edges.push({from:prerequisite,to:node.course.id,path:`M${x1} ${y1} C${x1+bend} ${y1},${x2-bend} ${y2},${x2} ${y2}`});
  }
  return {nodes,columns,edges,width:Math.max(240,offset),height:top+maxRows*rowHeight+20};
}
