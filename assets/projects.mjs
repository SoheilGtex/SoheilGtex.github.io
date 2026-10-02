// JSON is editable; generated HTML remains readable without JavaScript.
async function enhanceProjects() {
  try {
    const response=await fetch(new URL('../data/projects.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw new Error('Project data unavailable');
    const {projects}=await response.json();
    if(!Array.isArray(projects))throw new Error('A projects array is required');
    const ids=new Set();
    const rows=projects.map((project,index)=>{
      const url=new URL(project.url);
      if(url.protocol!=='https:'||!project.id||ids.has(project.id)||typeof project.title!=='string'||!project.title.trim()||typeof project.description!=='string')throw new Error('Invalid project entry');
      ids.add(project.id);
      const article=document.createElement('article');article.className='project-row';
      const number=document.createElement('span');number.className='project-index mono';number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
      const content=document.createElement('div'),heading=document.createElement('h3'),link=document.createElement('a'),arrow=document.createElement('span'),description=document.createElement('p');
      link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=project.title;
      arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(arrow);heading.append(link);description.textContent=project.description;
      content.append(heading,description);article.append(number,content);return article;
    });
    document.getElementById('project-list').replaceChildren(...rows);
    document.documentElement.dataset.projectsReady='true';
  } catch(error) {console.warn('Project enhancement unavailable:',error.message);}
}
enhanceProjects();
