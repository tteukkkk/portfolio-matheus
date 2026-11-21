'use strict';

/**
 * Portfólio de Matheus Macêdo Felicio
 * Os repositórios públicos são consultados diretamente na API REST do GitHub.
 * Caso a API esteja indisponível, exibimos uma seleção documentada de projetos.
 */
const GITHUB_USER = 'tteukkkk';
const GITHUB_API = `https://api.github.com/users/${GITHUB_USER}/repos`;

const fallbackProjects = [
  {name:'tradeagile', title:'TradeAgile', description:'Sistema acadêmico em Django para controle de estoque, importação de dados, relatórios, carrinho e pedidos.', language:'Python', category:'web', tags:['Python','Django','Estoque']},
  {name:'androshop', title:'AndroShop', description:'Loja virtual acadêmica em Django com catálogo, avaliações, carrinho, cupons e pedidos simulados.', language:'CSS', category:'web', tags:['Django','E-commerce','CSS']},
  {name:'controle-estoque', title:'Controle de Estoque', description:'Aplicação de gestão de estoque com entradas e saídas, histórico de movimentações e testes automatizados.', language:'Python', category:'web', tags:['Python','Django','Testes']},
  {name:'senai-agile-pwa', title:'SENAI Agile PWA', description:'Portal educacional acadêmico em Django com cursos, matrículas, notícias e recursos básicos de PWA.', language:'Python', category:'web', tags:['Django','PWA','Web']},
  {name:'garagem-autobots', title:'Garagem Autobots', description:'Cadastro de personagens em Django com testes de modelos, formulários e integração.', language:'Python', category:'web', tags:['Python','Django','Testes']},
  {name:'biblioteca-musical', title:'Biblioteca Musical', description:'Banco de dados MySQL para catálogo musical, playlists e avaliações, com modelagem, consultas e views.', language:null, category:'database', tags:['MySQL','SQL','Modelagem']},
  {name:'bora-bills-bar', title:'Bora Bills Bar', description:'Projeto com integração de APIs de clima, bebidas e personagens.', language:null, category:'web', tags:['APIs REST','Integração']},
  {name:'copa-do-mundo', title:'Copa do Mundo', description:'Banco de dados relacional para simulação de campeonato, com stored procedures.', language:null, category:'database', tags:['SQL','Procedures']},
  {name:'senai-agile-rpg', title:'SENAI Agile RPG', description:'Banco de dados de RPG educacional com personagens, classes e itens.', language:null, category:'database', tags:['SQL','Banco de dados']}
].map(p=>({...p, html_url:`https://github.com/${GITHUB_USER}/${p.name}`}));

const fallbackByName = new Map(fallbackProjects.map(project=>[project.name.toLowerCase(),project]));
const selectedFeatured = ['tradeagile','androshop','senai-agile-pwa'];
let projectList = fallbackProjects.slice();
let activeFilter = 'all';
let searchTerm = '';

const projectGrid = document.getElementById('projects-grid');
const featuredGrid = document.getElementById('featured-projects');
const repoMessage = document.getElementById('repo-message');
const projectCount = document.getElementById('repo-total');
const emptyResults = document.getElementById('empty-results');

function projectCategory(repo){
  const known = fallbackByName.get(repo.name.toLowerCase());
  if(known) return known.category;
  const text = [repo.name,repo.description,repo.language,...(repo.topics||[])].filter(Boolean).join(' ').toLowerCase();
  if(/\bsql\b|database|banco.de.dados|mysql|postgres|sqlite|modelagem|procedure/.test(text)) return 'database';
  if(/django|flask|website|site|web|api|front|back|html|css|javascript|loja|sistema|app|portal|pwa|e-commerce|estoque/.test(text)) return 'web';
  return 'other';
}

function normalizeProject(repo){
  const known = fallbackByName.get(repo.name.toLowerCase());
  const tags = known?.tags?.length ? known.tags : [];
  const topicTags = (Array.isArray(repo.topics) ? repo.topics : []).filter(Boolean).slice(0,2);
  return {
    name:repo.name,
    title:known?.title || repo.name.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    description:repo.description || known?.description || 'Repositório público com código e documentação disponíveis no GitHub.',
    language:repo.language || known?.language || null,
    tags:tags.length ? tags : [repo.language,...topicTags].filter(Boolean),
    category:projectCategory(repo),
    html_url:`https://github.com/${GITHUB_USER}/${encodeURIComponent(repo.name)}`,
    homepage:typeof repo.homepage === 'string' && /^https:\/\//i.test(repo.homepage) ? repo.homepage : null,
    updated_at:repo.pushed_at || repo.updated_at || ''
  };
}

function el(tag,className,text){
  const element = document.createElement(tag);
  if(className) element.className = className;
  if(text!==undefined) element.textContent = text;
  return element;
}

function makeTags(tags){
  const row = el('div','tag-row');
  tags.slice(0,3).forEach(tag=>row.append(el('span','tag',tag)));
  return row;
}

function makeRepoCard(repo){
  const card = el('a','repo-card reveal');
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label',`${repo.title} — abrir repositório no GitHub (nova aba)`);
  const top = el('div','repo-card-top');
  top.append(el('span','repo-icon',repo.category==='database'?'DB':repo.language==='Python'?'Py':repo.category==='web'?'Web':'</>'));
  top.append(el('span','repo-card-arrow','↗'));
  card.append(top,el('h4','',repo.title),el('p','',repo.description),makeTags(repo.tags));
  return card;
}

const projectPreviews = {
  'tradeagile':{src:'./assets/tradeagile-preview.webp',alt:'Prévia ilustrativa do painel de estoque TradeAgile, com barra lateral, filtros e tabela de produtos.'},
  'androshop':{src:'./assets/androshop-preview.webp',alt:'Prévia ilustrativa da página inicial do AndroShop, com banner, navegação e seções de vantagens.'},
  'senai-agile-pwa':{src:'./assets/senai-agile-pwa-preview.webp',alt:'Prévia ilustrativa do portal SENAI Agile, com notícias e menu de navegação.'}
};

function makeFeaturedCard(repo,index){
  const card = el('a','featured-card reveal');
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label',`${repo.title} — ver código no GitHub (nova aba)`);
  card.style.setProperty('--stagger',`${index*85}ms`);
  const art = el('div',`project-art art-${index+1}`);
  const preview=projectPreviews[repo.name.toLowerCase()];
  if(preview){
    const screenshot=el('img','project-screenshot');
    screenshot.src=preview.src;
    screenshot.alt=preview.alt;
    screenshot.loading='lazy';
    screenshot.width=1100;
    screenshot.height=680;
    art.append(screenshot,el('span','art-lilabel','PRÉVIA ILUSTRATIVA'));
  }else{
    art.append(el('span','art-lilabel','VER PROJETO NO GITHUB'));
  }
  const body = el('div','featured-body');
  body.append(el('span','featured-number',`PROJETO EM DESTAQUE / 0${index+1}`));
  const titleRow = el('div','featured-title-row');
  titleRow.append(el('h3','featured-title',repo.title),el('span','featured-arrow','↗'));
  body.append(titleRow,el('p','featured-description',repo.description),makeTags(repo.tags));
  card.append(art,body);
  return card;
}

function updateFeatured(){
  featuredGrid.replaceChildren();
  selectedFeatured.forEach((name,index)=>{
    const repo=projectList.find(project=>project.name.toLowerCase()===name) || fallbackProjects.find(project=>project.name===name);
    if(repo) featuredGrid.append(makeFeaturedCard(repo,index));
  });
  observeReveals(featuredGrid);
}

function updateAllProjects(){
  const filtered=projectList.filter(repo=>{
    const matchesFilter = activeFilter==='all' || repo.category===activeFilter;
    const matchesTerm = `${repo.title} ${repo.description} ${repo.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(searchTerm);
    return matchesFilter && matchesTerm;
  });
  projectGrid.replaceChildren(...filtered.map(makeRepoCard));
  observeReveals(projectGrid);
  emptyResults.hidden=filtered.length!==0;
}

function setCount(count){projectCount.textContent=count ? String(count).padStart(2,'0') : '';}

async function fetchAllRepositories(){
  const found=[];
  let page=1;
  while(page<=10){
    const response=await fetch(`${GITHUB_API}?sort=updated&direction=desc&per_page=100&page=${page}`,{
      headers:{'Accept':'application/vnd.github+json'},
      signal:AbortSignal.timeout(12000)
    });
    if(!response.ok) throw new Error(`GitHub respondeu HTTP ${response.status}`);
    const batch=await response.json();
    if(!Array.isArray(batch)) throw new Error('Resposta inesperada da API');
    found.push(...batch.filter(repo=>!repo.private && repo.owner?.login?.toLowerCase()===GITHUB_USER));
    if(batch.length<100) break;
    page++;
  }
  return found;
}

async function loadProjects(){
  // A lista de contingência é exibida imediatamente para evitar uma seção vazia.
  projectList=fallbackProjects.map(normalizeProject);
  setCount(projectList.length);
  updateFeatured();
  updateAllProjects();
  try{
    const fetched=await fetchAllRepositories();
    projectList=fetched.map(normalizeProject);
    setCount(projectList.length);
    updateFeatured();
    updateAllProjects();
    repoMessage.textContent=`${projectList.length} repositório${projectList.length===1?' público carregado':'s públicos carregados'} diretamente do GitHub. A listagem inclui projetos adicionados recentemente.`;
  }catch(error){
    repoMessage.textContent='Exibindo uma seleção de projetos. Não foi possível atualizar a lista automaticamente agora; acesse o GitHub para consultar todos os repositórios públicos.';
    console.warn('GitHub API indisponível; exibindo seleção local:',error);
  }
}

document.querySelectorAll('.filter-button').forEach(button=>{
  button.addEventListener('click',()=>{
    activeFilter=button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach(item=>{
      const selected=item===button;
      item.classList.toggle('active',selected);
      item.setAttribute('aria-pressed',String(selected));
    });
    updateAllProjects();
  });
});

document.getElementById('project-search').addEventListener('input',event=>{
  searchTerm=event.target.value.trim().toLocaleLowerCase('pt-BR');
  updateAllProjects();
});

const mobileToggle=document.getElementById('mobile-toggle');
const mobileMenu=document.getElementById('nav-links');
mobileToggle.addEventListener('click',()=>{
  const opened=mobileMenu.classList.toggle('is-open');
  mobileToggle.setAttribute('aria-expanded',String(opened));
  mobileToggle.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');
});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  mobileMenu.classList.remove('is-open');
  mobileToggle.setAttribute('aria-expanded','false');
  mobileToggle.setAttribute('aria-label','Abrir menu');
}));



// Tema persistente e ícone acessível (respeita a preferência do navegador na primeira visita).
const themeButton=document.getElementById('theme-toggle');
function syncThemeButton(){
  const isDark=document.documentElement.dataset.theme==='dark';
  themeButton.setAttribute('aria-label',isDark?'Ativar modo claro':'Ativar modo escuro');
  themeButton.title=isDark?'Mudar para modo claro':'Mudar para modo escuro';
  const themeColor=document.querySelector('meta[name="theme-color"]');
  if(themeColor)themeColor.content=isDark?'#111018':'#fbfaff';
}
syncThemeButton();
themeButton.addEventListener('click',()=>{
  const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=theme;
  try{localStorage.setItem('portfolio-theme',theme);}catch(error){console.info('Preferência de tema não armazenada.');}
  syncThemeButton();
});

// Revelações discretas com melhoria progressiva: sem JS ou com movimento reduzido, conteúdo visível.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver=null;
function observeReveals(root=document){
  if(!revealObserver)return;
  root.querySelectorAll('.reveal:not(.is-visible)').forEach(node=>revealObserver.observe(node));
}
if('IntersectionObserver' in window && !reduceMotion.matches){
  document.documentElement.classList.add('js-motion');
  revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  },{threshold:0.08,rootMargin:'0px 0px -24px 0px'});
  document.querySelectorAll('.section-rail, .about-content, .projects-intro, .skills-copy, .skill-item, .all-projects-heading, .contact-left').forEach((node,index)=>{
    node.classList.add('reveal');
    node.style.setProperty('--stagger',`${Math.min(index%4,3)*60}ms`);
  });
  observeReveals(document);
}

loadProjects();
