import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summarize,validateRecord,groupCourses,courseworkLayout,displayedCourses,displayRecord,creditTotal,workingSummary,evaluatedGpa} from '../assets/academic-model.mjs';
const record=JSON.parse(fs.readFileSync(new URL('../data/academics.json',import.meta.url)));
const course=(id,status,credits,grade,extra={})=>({id,title:id,status,credits,grade,profile_visible:true,category:'core',prerequisites:[],...extra});
const currentNames={'Numerical Linear Algebra':4,'Mathematical Analysis':4,'Introductory Mathematical Modeling':3,'Operating Systems':4,'Design and Analysis of Algorithms':4};
const plannedNames={'MATLAB II':1,'Calculus III':3,'Foundations of Algebra':4,'Introduction to Differential Geometry':4,'Abstract Algebra I':4,'Operations Research':4,'Nonlinear Optimization':4,'General Topology':4,'Linear Algebra':4,'Introduction to Theory of Computation':3,'Database Systems':3,'Machine Learning':3,'Artificial Intelligence':3,'Computer Networks':3,'Dynamic Optimization':3,'Coding Theory':3};
const interestNames={'Distributed Systems':3,'Foundations of Fourier Analysis and Wavelets':3,'Mathematical Modeling':3,'Introduction to Game Theory':3,'Introduction to Data Mining':3,'Graph Theory':3,'Probability I':4,'Stochastic Processes':4};

test('current record validates and cumulative/relevant calculations use their distinct sources',()=>{
  validateRecord(record);
  const working=workingSummary(record),relevant=summarize(displayedCourses(record));
  assert.deepEqual(working,{gpa:1246.75/69,gradedCredits:69,completedCredits:69});
  assert.deepEqual(relevant,{gpa:986.75/56,gradedCredits:56,completedCredits:56});
  assert.equal(working.gpa.toFixed(2),'18.07');assert.equal(relevant.gpa.toFixed(2),'17.62');
});
test('five confirmed in-progress courses total 19 credits and have no grades',()=>{
  const current=displayedCourses(record).filter(c=>c.status==='in_progress');
  assert.equal(current.length,5);assert.equal(creditTotal(current),19);
  assert.deepEqual(Object.fromEntries(current.map(c=>[c.title,c.credits])),currentNames);
  assert.ok(current.every(c=>c.grade===null&&c.semester===null));
  assert.deepEqual(summarize(current),{gpa:null,gradedCredits:0,completedCredits:0});
});
test('formal future plan contains exactly the sixteen supplied courses and credit values',()=>{
  const planned=groupCourses(record).find(g=>g.key==='planned').courses;
  assert.equal(planned.length,16);assert.equal(creditTotal(planned),53);
  assert.deepEqual(Object.fromEntries(planned.map(c=>[c.title,c.credits])),plannedNames);
  assert.ok(planned.every(c=>c.status==='planned'&&c.grade===null&&c.semester===null&&c.prerequisites.length===0));
  assert.deepEqual(summarize(planned),{gpa:null,gradedCredits:0,completedCredits:0});
});
test('interest-only study is a separate eight-course group, planned and outside degree requirements',()=>{
  const groups=groupCourses(record),interest=groups.find(g=>g.key==='interest_only');
  assert.deepEqual(groups.map(g=>g.title),['COMPLETED','IN PROGRESS','PLANNED','BEYOND CURRICULUM']);
  assert.equal(interest.context,'Interest-driven study');assert.match(interest.note,/Outside formal degree requirements/);
  assert.equal(interest.courses.length,8);assert.equal(creditTotal(interest.courses),26);
  assert.deepEqual(Object.fromEntries(interest.courses.map(c=>[c.title,c.credits])),interestNames);
  assert.ok(interest.courses.every(c=>c.status==='planned'&&c.category==='interest_only'&&c.grade===null));
  assert.ok(groups.filter(g=>g.key!=='interest_only').every(g=>g.courses.every(c=>c.category!=='interest_only')));
});
test('explicit profile visibility preserves hidden general records and retains General English',()=>{
  const visible=displayedCourses(record);
  assert.equal(record.courses.length,57);assert.equal(visible.length,47);
  assert.equal(record.courses.filter(c=>c.profile_visible===false).length,10);
  assert.ok(record.courses.every(c=>typeof c.profile_visible==='boolean'));
  for(const c of record.courses.filter(c=>['general','outside_chart'].includes(c.category))){assert.equal(c.profile_visible,c.id==='general-english');}
  assert.ok(visible.some(c=>c.title==='General English'));
  assert.ok(!visible.some(c=>c.id==='linear-optimization'));
  const fixture={gpa_scale:20,courses:[course('a','completed',4,10),course('b','completed',4,20,{profile_visible:false})]};
  assert.equal(summarize(displayedCourses(fixture)).gpa,10);
});
test('Calculus I, II and III are normalized while raw English/Persian sources remain intact',()=>{
  for(const [id,title,raw] of [['general-mathematics-i','Calculus I','General Mathematics I'],['general-mathematics-ii','Calculus II','General Mathematics II'],['general-mathematics-iii','Calculus III','General Mathematics III']]){
    const c=record.courses.find(c=>c.id===id);assert.equal(c.title,title);assert.equal(c.source_record.title,raw);assert.ok(c.title_fa);
  }
});
test('planned and in-progress statuses cannot inflate GPA even with numeric grades',()=>{
  assert.deepEqual(summarize([course('a','completed',4,10),course('b','in_progress',100,20),course('c','planned',100,20)]),{gpa:10,gradedCredits:4,completedCredits:4});
});
test('missing or invalid grades/credits do not enter the weighted denominator',()=>{
  assert.deepEqual(summarize([course('a','completed',4,0),course('b','completed',2,null),course('c','completed',1,21),course('d','completed',3,'20'),course('e','completed',null,20)]),{gpa:0,gradedCredits:4,completedCredits:10});
  assert.deepEqual(summarize([]),{gpa:null,gradedCredits:0,completedCredits:0});
});
test('no four-point result is invented; an external value requires a named method',()=>{
  assert.deepEqual(record.gpa_4,{value:null,method:null,note:'Use a named credential evaluator or receiving institution method.'});
  assert.equal(evaluatedGpa(record),null);
  for(const gpa_4 of [{value:3.7,method:null},{value:3.7,method:' '},{value:4.1,method:'Evaluator'},{value:'3.7',method:'Evaluator'}])assert.equal(evaluatedGpa({gpa_4}),null);
  const gpa_4={value:3.7,method:'Synthetic named evaluator for QA only',note:'Fixture only'};assert.equal(evaluatedGpa({gpa_4}),gpa_4);
});
test('future data-only additions and visibility changes update groups, averages, category and credits',()=>{
  const fixture=structuredClone(record);
  fixture.courses.push(course('future-qa-course','completed',3,20,{title:'QA future course',semester:12}));
  validateRecord(fixture);assert.equal(displayedCourses(fixture).length,48);
  assert.equal(summarize(displayedCourses(fixture)).gpa,1046.75/59);
  assert.equal(workingSummary(fixture).gpa,1306.75/72);
  assert.equal(groupCourses(fixture)[0].courses.at(-1).title,'QA future course');
  assert.ok(groupCourses(fixture).every(g=>!g.title.includes('Semester')));
  fixture.courses.at(-1).profile_visible=false;assert.equal(summarize(displayedCourses(fixture)).gpa,986.75/56);
  fixture.courses.at(-1).category='interest_only';assert.equal(workingSummary(fixture).gpa,1246.75/69);
});
test('map has zero invented dependencies and activates only verified visible prerequisites',()=>{
  const currentMap=courseworkLayout(record);
  assert.equal(currentMap.edges.length,0);assert.equal(currentMap.nodes.length,47);
  assert.equal(currentMap.columns.length,4);assert.equal(currentMap.width,960);
  assert.ok(currentMap.nodes.every(n=>n.course.profile_visible));
  const fixture={gpa_scale:20,courses:[course('a','completed',4,18),course('b','planned',2,null,{prerequisites:['a']})]};
  validateRecord(fixture);assert.equal(courseworkLayout(fixture).edges.length,0);
  fixture.prerequisite_data_status='verified';const map=courseworkLayout(fixture);
  assert.equal(map.edges.length,1);assert.equal(map.edges[0].from,'a');assert.equal(map.edges[0].to,'b');
  fixture.courses[0].profile_visible=false;assert.equal(courseworkLayout(displayRecord(fixture)).edges.length,0);
  assert.deepEqual(courseworkLayout(fixture),courseworkLayout(fixture));
});
test('invalid visibility, duplicate IDs, unknown prerequisites and cycles are rejected',()=>{
  const fixture={gpa_scale:20,courses:[course('a','completed',4,18,{prerequisites:['b']}),course('b','planned',2,null,{prerequisites:['a']})]};
  assert.throws(()=>validateRecord(fixture),/cycle/);
  fixture.courses[1].prerequisites=[];fixture.courses[0].prerequisites=['missing'];assert.throws(()=>validateRecord(fixture),/Invalid prerequisite/);
  fixture.courses[0].prerequisites=[];fixture.courses[0].profile_visible='true';assert.throws(()=>validateRecord(fixture),/profile visibility/);
  fixture.courses[0].profile_visible=true;fixture.courses.push({...fixture.courses[0]});assert.throws(()=>validateRecord(fixture),/unique/);
});
test('TA history includes MATLAB II and the four existing course names',()=>{
  assert.equal(record.teaching_assistant.institution,'Kharazmi University');
  assert.deepEqual(record.teaching_assistant.courses,['Programming with R','Mathematical Software','Probability I','Statistical Methods','MATLAB II']);
});
