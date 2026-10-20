/* FitSwap Mobile 1.0 — UX de app nativo, offline e sem dependências externas.
 * Mesmo catálogo do FitSwap 0.1: 103 exercícios, 62 equipamentos, 17 grupos.
 */
(() => {
'use strict';
const DB = window.FITSWAP_DATA;
if (!DB?.exercises?.length || !DB?.equipment?.length) {
  document.getElementById('screen').innerHTML = '<div class="empty-state">Catálogo indisponível. Mantenha dados.js na mesma pasta de index.html.</div>';
  return;
}
const q = selector => document.querySelector(selector);
const icon = (name, size='') => `<svg class="icon ${size}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const find = (haystack,needle) => normalize(haystack).includes(normalize(needle));
const sorted = items => [...items].sort((a,b)=> a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'}));
const index = items => Object.fromEntries(items.map(item=>[item.id,item]));
const equipment = index(DB.equipment), muscles = index(DB.muscles), patterns = index(DB.patterns), exercises = index(DB.exercises);
const eqName = id => equipment[id]?.name ?? id;
const mName = id => muscles[id]?.name ?? id;
const pName = id => patterns[id]?.name ?? id;
const allExercises = sorted(DB.exercises), allEquipment = sorted(DB.equipment);
const MEDIA = window.FITSWAP_MEDIA || {assets:[], equipment:{}, exercises:{}};
const allowedMediaPath = path => /^media\/[a-z0-9][a-z0-9/_\-]*\.(webp|avif|png|jpe?g)$/i.test(path || '') || /^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/[a-z0-9%_.()\-]+\/[0-9]+px-[a-z0-9%_.()\-]+\.(webp|png|jpe?g)$/i.test(path || '');
const MODELS = Array.isArray(window.FITSWAP_MODELS)?window.FITSWAP_MODELS:[];
const mediaAssets = Object.fromEntries((MEDIA.assets || []).map(asset=>[asset.id, asset]));
const modelsByEquipment = MODELS.reduce((acc,model)=>{ (acc[model.equipmentId] ||= []).push(model);return acc; },{});
function authorizedMedia(kind,id){
  const group=kind==='equipment'?MEDIA.equipment:MEDIA.exercises;
  return (group?.[id] || []).map(assetId=>mediaAssets[assetId]).filter(asset=>
    asset && asset.status==='approved' && asset.license?.approvedBy &&
    allowedMediaPath(asset.path) &&
    /^https:\/\//.test(asset.license?.sourceUrl || '') && /^https:\/\//.test(asset.license?.licenseUrl || '')
  );
}
function mediaThumbnail(kind,id, fallbackIcon='gym'){
  const first=authorizedMedia(kind,id)[0];
  return first
    ? `<img class="media-thumb" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${escapeHTML(first.path)}" alt="${escapeHTML(first.alt)}" title="${escapeHTML(first.license.credit)} — veja detalhes para fonte e licença" data-fallback-icon="${escapeHTML(fallbackIcon)}">`
    : `<span class="media-placeholder-symbol">${icon(fallbackIcon,'s28')}</span>`;
}
function mediaGallery(kind,id,label){
  const items=authorizedMedia(kind,id);
  if(!items.length) return `<div class="media-gallery media-gallery-empty" role="status">
    <div class="media-gallery-symbol">${icon(kind==='equipment'?'gym':'target','s32')}</div>
    <strong>Imagem em preparação</strong><span>Fotografias e demonstrações serão adicionadas após revisão das licenças.</span>
  </div>`;
  return `<div class="media-gallery media-gallery-scroll" role="region" aria-label="Galeria de ${escapeHTML(label)}" tabindex="0">${items.map(a=>
    `<figure class="media-figure"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${escapeHTML(a.path)}" alt="${escapeHTML(a.alt)}" data-gallery-img="1"><figcaption><span>${escapeHTML(a.license.credit || a.license.author)}</span><nav class="media-credits" aria-label="Créditos da imagem"><a href="${escapeHTML(a.license.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fonte ↗</a><a href="${escapeHTML(a.license.licenseUrl)}" target="_blank" rel="noopener noreferrer">Licença ↗</a></nav></figcaption><div class="media-photo-note">${escapeHTML(a.license.modifications || "Arquivo original sem alterações")} · Foto ilustrativa; fabricantes não patrocinam o FitSwap. ${a.delivery==='external-preview'?'Conexão necessária para visualizar esta foto.':''}</div></figure>`
  ).join('')}</div>`;
}

const commonEq = new Set(['halter','barra','barra_w','rack','banco_reto','banco_incl','smith','leg45','leg_h','extensora','flexora_mesa','flexora_sent','abdutora','adutora','pulldown','row_seated','crossover','polia_alta','polia_baixa','chest','peck','shoulder','barra_fixa','colchonete','step','pant_sent']);
const recommendationNotice = () => `<div class="recommendation-notice" role="note">${icon('info','s18')}<span>As opções exibidas são referências informativas, não uma prescrição ou garantia de equivalência entre exercícios. O FitSwap não substitui a avaliação e orientação de um profissional de Educação Física habilitado.</span></div>`;
const navItems = [{id:'home',label:'Início',icon:'home'},{id:'explore',label:'Explorar',icon:'search'},{id:'gym',label:'Academia',icon:'gym'},{id:'saved',label:'Salvos',icon:'heart'}];
const modeItems = [{id:'muscle',label:'Músculos'},{id:'equipment',label:'Máquinas'},{id:'exercise',label:'Exercícios'}];
const validSet = (value, index) => new Set(Array.isArray(value)?value.filter(id=>index[id]):[]);
function loadSettings(){try { return JSON.parse(localStorage.getItem('fitswap-mobile-1.0')||'null') || JSON.parse(localStorage.getItem('fitswap-mvp-0.1')||'{}'); }catch {return {};}}
const saved=loadSettings();
const state={
  page:'home',mode:'muscle',muscle:'quadriceps',category:'Todas',exploreQuery:'',gymQuery:'',quickQuery:'',gymList:'Todos',
  gym:validSet(saved.gym,equipment),busy:validSet(saved.busy,equipment),favorites:validSet(saved.favorites,exercises),
  gymOnly:!!saved.gymOnly,pageSize:16,sheet:null
};
const main=q('#screen'),root=q('#sheet-root');
function persist(){try{localStorage.setItem('fitswap-mobile-1.0',JSON.stringify({gym:[...state.gym],busy:[...state.busy],favorites:[...state.favorites],gymOnly:state.gymOnly}));}catch{}}
let toastTimer;
function toast(message){ const n=q('#toast');n.textContent=message;n.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('show'),2600); }
function primaryMuscle(ex, m){return ex.primary.includes(m);}
function matchMuscle(ex, m){return ex.primary.includes(m) || ex.secondary.includes(m);}
function hasGymKit(kit){return kit.every(id=>!state.gymOnly || state.gym.has(id));}
function kitAvailable(kit){return hasGymKit(kit) && kit.every(id=>!state.busy.has(id));}
function exAvailable(ex){return ex.setups.some(kitAvailable);}
function exText(ex){return [ex.name, pName(ex.pattern), ...ex.primary.map(mName),...ex.secondary.map(mName),...ex.setups.flat().map(id=>[eqName(id),...(equipment[id]?.aliases||[])].join(' '))].join(' ');}
function equipmentText(eq){return [eq.name,eq.group,...eq.aliases,...(modelsByEquipment[eq.id]||[]).flatMap(m=>[m.brand,m.model,...(m.aliases||[])])].join(' ');}
function relatedToEq(id){return allExercises.filter(ex=>ex.setups.some(kit=>kit.includes(id)));}
function excerpt(ex){return [...new Set(ex.setups.flat().map(eqName))].slice(0,2).join(' · ');}
function availableAlternatives(ex){
  return window.FITSWAP_SUBSTITUICOES.getAlternatives({
    target:ex, exercises:DB.exercises, isKitAvailable:kitAvailable, gym:state.gym
  });
}
function titleForPage(){return ({home:'fitswap',explore:'Explorar',gym:'Minha academia',saved:'Salvos'})[state.page]||'FitSwap';}
function renderHeader(){
  const home=state.page==='home';
  q('#header').innerHTML=`<div class="header-left"><span class="header-eyebrow">${home?'SEU COMPANHEIRO DE TREINO':'FITSWAP · SEU TREINO'}</span><h1 class="header-title">${home?'fit<span style="color:#6e9f43">swap</span>':titleForPage()}</h1></div>
    <div class="header-actions"><button class="icon-button" data-action="navigate" data-id="${state.page==='gym'?'explore':'gym'}" aria-label="${state.page==='gym'?'Explorar exercícios':'Configurar academia'}">${icon(state.page==='gym'?'search':'settings')}</button></div>`;
}
function renderNav(){
  q('#bottom-nav').innerHTML=navItems.map(item=> `<button class="nav-item ${state.page===item.id?'active':''}" data-action="navigate" data-id="${item.id}" ${state.page===item.id?'aria-current="page"':''} aria-label="${item.label}">${icon(item.icon)}<span>${item.label}</span>${item.id==='saved'&&state.favorites.size?`<span class="small-count">${state.favorites.size}</span>`:''}</button>`).join('');
  q('#fab').classList.toggle('hide',!!state.sheet || state.page==='gym');
}
function statHTML(){return `<div class="stats-line"><div class="mini-stat"><strong>${DB.exercises.length}</strong><span>exercícios</span></div><div class="mini-stat"><strong>${DB.equipment.length}</strong><span>equipamentos</span></div><div class="mini-stat"><strong>${DB.muscles.length}</strong><span>grupos musculares</span></div></div>`;}
function muscleCard(m){const count=DB.exercises.filter(ex=>primaryMuscle(ex,m.id)).length;return `<button class="muscle-card" data-action="go-muscle" data-id="${m.id}"><span class="muscle-symbol">${icon('target','s24')}</span><span><strong>${escapeHTML(m.name)}</strong><small style="display:block;margin-top:4px">${count} exercícios</small></span></button>`;}
function status(ex){
  const anyInGym=ex.setups.some(hasGymKit);
  if(!anyInGym)return `<span class="status-chip neutral">Fora da seleção</span>`;
  return exAvailable(ex)?`<span class="status-chip"><span class="status-dot"></span> Disponível*</span>`:`<span class="status-chip warn"><span class="status-dot"></span> Ocupado*</span>`;
}
function visualFor(ex){let i='gym';const pat=normalize(pName(ex.pattern));if(pat.includes('empurrar'))i='bolt'; else if(pat.includes('extens')||pat.includes('agachar'))i='target'; else if(pat.includes('puxar')||pat.includes('remar'))i='swap';return icon(i,'s28');}
function exerciseCard(ex, showStatus=true){
  const fav=state.favorites.has(ex.id);
  return `<article class="feed-card"><div class="visual media-visual">${mediaThumbnail('exercise',ex.id,'target')}</div><button class="content" data-action="exercise" data-id="${ex.id}" style="display:block;background:transparent;text-align:left;padding:0;border:0"><div class="eyebrow">${escapeHTML(ex.primary.map(mName).join(' · '))}</div><h3 class="name">${escapeHTML(ex.name)}</h3><div class="meta">${escapeHTML(excerpt(ex))}</div>${showStatus?`<div style="margin-top:7px">${status(ex)}</div>`:''}</button><div class="trailing"><button class="heart-button ${fav?'active':''}" data-action="favorite" data-id="${ex.id}" aria-label="${fav?'Remover dos salvos':'Salvar'} ${escapeHTML(ex.name)}">${icon('heart')}</button><button class="chev-btn" data-action="exercise" data-id="${ex.id}" aria-label="Abrir ${escapeHTML(ex.name)}">${icon('chevron','s18')}</button></div></article>`;
}
function equipmentCard(eq){
  const related=relatedToEq(eq.id).length;
  const busy=state.busy.has(eq.id),included=state.gym.has(eq.id);
  return `<article class="feed-card"><div class="visual media-visual ${busy?'orange':'green'}">${mediaThumbnail('equipment',eq.id,'gym')}</div><button class="content" style="display:block;background:none;text-align:left;padding:0" data-action="equipment" data-id="${eq.id}"><div class="eyebrow">${escapeHTML(eq.group)}</div><h3 class="name">${escapeHTML(eq.name)}</h3><div class="meta">${related} exercícios · ${escapeHTML(eq.aliases?.[0]||'Equipamento')}</div><div style="margin-top:7px"><span class="status-chip ${busy?'warn':included?'':'neutral'}">${busy?'Ocupado*':included?'Na minha academia':'Ver exercícios'}</span></div></button><button class="chev-btn" data-action="equipment" data-id="${eq.id}" aria-label="Detalhes de ${escapeHTML(eq.name)}">${icon('chevron','s18')}</button></article>`;
}
function renderHome(){
  const topMuscles=['quadriceps','peito','costas','gluteos','biceps','triceps','posterior','ombro_lat'].map(id=>muscles[id]).filter(Boolean);
  const featured=['leg45','extensora','peck','chest','pulldown'].map(id=>equipment[id]).filter(Boolean);
  return `<div class="screen-content home">
    <div class="home-welcome"><span class="hello">Hoje é dia de evoluir.</span><span class="date-pill">TREINO SEM FILA ${icon('bolt','s18')}</span></div>
    <section class="hero"><p class="hero-kicker"><span class="pulse"></span> MOVIMENTO SEM PAUSA</p><h2>Máquina ocupada?<br><em>Seu treino continua.</em></h2><p class="hero-description">Encontre outra forma de trabalhar o mesmo músculo, sem perder tempo.</p><button class="primary-button" data-action="quick-swap">${icon('swap')} Encontrar alternativa ${icon('arrow-right')}</button>${icon('gym','hero-icon')}</section>
    ${statHTML()}
    <div class="section-heading"><h2>Qual músculo hoje?</h2><button class="text-link" data-action="navigate" data-id="explore">Ver todos ${icon('chevron')}</button></div>
    <div class="muscle-scroll no-scrollbar">${topMuscles.map(muscleCard).join('')}</div>
    <div class="section-heading"><h2>Seu espaço, seu treino</h2></div>
    <button class="focus-banner" data-action="navigate" data-id="gym" style="width:100%;text-align:left"><span class="focus-icon">${icon('gym','s24')}</span><span class="text"><strong>${state.gym.size?`${state.gym.size} equipamentos configurados`:'Personalize sua academia'}</strong><small>${state.gymOnly?'Só sugerimos equipamentos da sua lista.':'Marque os aparelhos disponíveis e os ocupados.'}</small></span>${icon('chevron')}</button>
    <div class="section-heading"><h2>Máquinas populares</h2><button class="text-link" data-action="go-mode" data-id="equipment">Explorar ${icon('chevron')}</button></div>
    <div class="feed-list">${featured.map(equipmentCard).join('')}</div>
    <p class="small-disclaimer">* Disponibilidade baseada somente nas marcações feitas neste dispositivo; não há acesso em tempo real à academia.</p>
  </div>`;
}
function equipmentCategories(){return ['Todas',...new Set(DB.equipment.map(eq=>eq.group))].sort((a,b)=>a==='Todas'?-1:b==='Todas'?1:a.localeCompare(b,'pt-BR'));}
function filteredExplore(){
 if(state.mode==='equipment')return allEquipment.filter(eq=>(state.category==='Todas'||eq.group===state.category)&&(!state.gymOnly||state.gym.has(eq.id))&&find(equipmentText(eq),state.exploreQuery));
 let items=allExercises.filter(ex=>!state.gymOnly||ex.setups.some(hasGymKit)).filter(ex=>find(exText(ex),state.exploreQuery));
 if(state.mode==='muscle')items=items.filter(ex=>matchMuscle(ex,state.muscle)).sort((a,b)=>Number(primaryMuscle(b,state.muscle))-Number(primaryMuscle(a,state.muscle))||a.name.localeCompare(b.name,'pt-BR'));
 return items;
}
function exploreFilters(){
 if(state.mode==='muscle')return `<div class="subheading"><strong>Grupo muscular</strong><span>Deslize para explorar →</span></div><div class="chips-scroll no-scrollbar" role="group" aria-label="Grupos musculares">${[...DB.muscles].sort((a,b)=>{const ranks=['quadriceps','peito','costas','gluteos','posterior','biceps','triceps','ombro_lat','abdomen','panturrilha'];const ra=ranks.indexOf(a.id),rb=ranks.indexOf(b.id);return (ra<0?100:ra)-(rb<0?100:rb)||a.name.localeCompare(b.name,'pt-BR');}).map(m=>`<button class="chip ${state.muscle===m.id?'active':''}" data-action="choose-muscle" data-id="${m.id}" aria-pressed="${state.muscle===m.id}">${escapeHTML(m.name)}</button>`).join('')}</div>`;
 if(state.mode==='equipment')return `<div class="subheading"><strong>Categoria de equipamento</strong><span>Deslize →</span></div><div class="chips-scroll no-scrollbar" role="group" aria-label="Categorias">${equipmentCategories().map(cat=>`<button class="chip ${state.category===cat?'active':''}" data-action="choose-category" data-id="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`).join('')}</div>`;
 return `<p class="section-caption">Encontre o movimento pelo nome, músculo trabalhado ou equipamento necessário.</p>`;
}
function resultsExplore(){
 const items=filteredExplore(),n=state.pageSize,label=state.mode==='muscle'?mName(state.muscle):state.mode==='equipment'?'Equipamentos':'Todos os exercícios';
 return `<div class="results-header"><strong>${escapeHTML(label)}</strong><small>${items.length} resultados</small></div>
   <div class="feed-list">${items.length?items.slice(0,n).map(i=>state.mode==='equipment'?equipmentCard(i):exerciseCard(i)).join(''):`<div class="empty-state">${icon('search','s32')}<strong>Não encontramos resultados</strong><p>Tente outro nome ou revise os equipamentos selecionados na sua academia.</p><button data-action="reset-search">Limpar busca</button></div>`}</div>
   ${items.length>n?`<button class="load-btn" data-action="load-more">Mostrar mais ${Math.min(16,items.length-n)} resultados ${icon('arrow-right','s18')}</button>`:''}`;
}
function renderExplore(){
 return `<div class="screen-content" id="explore-swipes">
   <p class="screen-lead">Encontre o próximo movimento em poucos toques.</p>
   <label class="search-field">${icon('search')}<input id="explore-search" data-input="explore" type="search" inputmode="search" placeholder="Buscar músculo, máquina ou exercício" value="${escapeHTML(state.exploreQuery)}" autocomplete="off" aria-label="Pesquisar no catálogo"></label>
   <div class="mode-tabs" role="tablist" aria-label="Tipo de busca">${modeItems.map(m=>`<button role="tab" aria-selected="${state.mode===m.id}" class="${state.mode===m.id?'active':''}" data-action="set-mode" data-id="${m.id}">${m.label}</button>`).join('')}</div>
   ${exploreFilters()}
   <div class="result-tools" style="margin-top:12px"><button class="compact-filter ${state.gymOnly?'active':''}" data-action="toggle-gym-only">${icon('filter','s18')} ${state.gymOnly?'Só minha academia':'Toda a base'}</button>${state.busy.size?`<span class="status-chip warn">${state.busy.size} ocupados*</span>`:''}</div>
   <div id="explore-results" aria-live="polite">${resultsExplore()}</div>
 </div>`;
}
function filteredGym(){return allEquipment.filter(eq=>(state.gymList==='Todos'||(state.gymList==='Meus'&&state.gym.has(eq.id))||(state.gymList==='Ocupados'&&state.busy.has(eq.id)))&&find(equipmentText(eq),state.gymQuery));}
function gymResults(){
 const all=filteredGym();return `<div class="results-header"><strong>Equipamentos</strong><small>${all.length} encontrados</small></div><div class="feed-list">${all.length?all.map(eq=>{
   const checked=state.gym.has(eq.id),busy=state.busy.has(eq.id);
   return `<article class="gym-row"><button class="select-square ${checked?'selected':''}" data-action="toggle-gym" data-id="${eq.id}" aria-pressed="${checked}" aria-label="${checked?'Remover':'Adicionar'} ${escapeHTML(eq.name)} na academia">${icon(checked?'check':'plus')}</button><button class="body" data-action="equipment" data-id="${eq.id}" style="text-align:left;padding:0;background:none"><strong>${escapeHTML(eq.name)}</strong><small>${escapeHTML(eq.group)} · ${relatedToEq(eq.id).length} exercícios</small></button><button class="busy-button ${busy?'busy':''}" data-action="toggle-busy" data-id="${eq.id}" aria-pressed="${busy}">${busy?'Ocupado':'Marcar ocupado'}</button></article>`;
  }).join(''):`<div class="empty-state">${icon('gym','s32')}<strong>Nenhum equipamento aqui</strong><p>Selecione outra lista ou limpe a busca.</p><button data-action="gym-list" data-id="Todos">Ver todos</button></div>`}</div>`;
}
function renderGym(){
 return `<div class="screen-content"><div class="gym-summary"><div><div class="gym-summary-num">${state.gym.size}<span> / ${DB.equipment.length}</span></div></div><div><strong>Seu mapa de equipamentos</strong><small>Marque os aparelhos que existem na sua academia e os que estão ocupados.</small></div></div>
  <div class="toggle-row"><span class="copy"><strong>Filtrar pela minha academia</strong><small>Mostra apenas equipamentos cadastrados</small></span><button class="switch ${state.gymOnly?'on':''}" data-action="toggle-gym-only" role="switch" aria-checked="${state.gymOnly}" aria-label="Filtrar somente minha academia"></button></div>
  <div class="gym-toolbar"><button class="outline-pill" data-action="preset-gym">${icon('spark','s18')} Selecionar comuns</button><button class="outline-pill" data-action="clear-busy">${icon('x','s18')} Liberar ocupados</button></div>
  <label class="search-field">${icon('search')}<input id="gym-search" data-input="gym" placeholder="Buscar equipamento" value="${escapeHTML(state.gymQuery)}" autocomplete="off" aria-label="Buscar equipamentos da academia"></label>
  <div class="mode-tabs" role="tablist" aria-label="Filtrar lista de equipamentos">${['Todos','Meus','Ocupados'].map(v=>`<button role="tab" aria-selected="${state.gymList===v}" data-action="gym-list" data-id="${v}" class="${state.gymList===v?'active':''}">${v}${v==='Ocupados'&&state.busy.size?` (${state.busy.size})`:''}</button>`).join('')}</div>
  <div id="gym-results" aria-live="polite">${gymResults()}</div>
  <p class="small-disclaimer">As marcações de ocupação são manuais e ficam salvas apenas neste navegador, neste dispositivo.</p>
 </div>`;
}
function renderSaved(){
 const items=allExercises.filter(ex=>state.favorites.has(ex.id));
 return `<div class="screen-content"><p class="screen-lead">Seus movimentos preferidos, sempre à mão.</p>
 <div class="focus-banner" style="margin-bottom:22px"><span class="focus-icon">${icon('heart')}</span><span class="text"><strong>${items.length} exercícios salvos</strong><small>Toque no coração para adicionar ou remover favoritos.</small></span></div>
 <div class="results-header"><strong>Minha lista</strong><small>${items.length} exercícios</small></div>
 <div class="feed-list">${items.length?items.map(i=>exerciseCard(i)).join(''):`<div class="empty-state">${icon('heart','s32')}<strong>Seus favoritos aparecerão aqui</strong><p>Explore os exercícios e toque no ícone de coração dos que desejar salvar.</p><button data-action="navigate" data-id="explore">Explorar exercícios</button></div>`}</div></div>`;
}
function renderScreen(preserveScroll=false){
 const top=preserveScroll?main.scrollTop:0;
 renderHeader();renderNav();
 main.innerHTML=state.page==='home'?renderHome():state.page==='explore'?renderExplore():state.page==='gym'?renderGym():renderSaved();
 main.scrollTop=top;
 const chips=main.querySelector('.chips-scroll');
 const selected=chips?.querySelector('.chip.active');
 if(selected){const target=selected.getBoundingClientRect().left-chips.getBoundingClientRect().left;chips.scrollLeft+=target-4;}
}
function openSheet(type,id=null,tab='alternatives'){
 state.sheet={type,id,tab};state.quickQuery='';renderNav();renderSheet();q('.sheet-close')?.focus({preventScroll:true});
}
function closeSheet(){state.sheet=null;root.innerHTML='';renderNav();}
function sheetHead(kicker,title){return `<div class="sheet-top"><div class="drag-handle" id="sheet-handle" aria-hidden="true"></div><div class="sheet-head"><div class="label"><small>${escapeHTML(kicker)}</small><h2>${escapeHTML(title)}</h2></div><button class="icon-button mini sheet-close" data-action="close-sheet" aria-label="Fechar detalhes">${icon('x')}</button></div></div>`;}
function eqActions(id){
 const checked=state.gym.has(id),busy=state.busy.has(id);
 return `<div class="equip-status-actions"><button class="toggle-action ${checked?'dark':''}" data-action="toggle-gym" data-id="${id}">${icon(checked?'check':'plus','s18')} ${checked?'Na minha academia':'Adicionar à academia'}</button><button class="toggle-action ${busy?'warn':''}" data-action="toggle-busy" data-id="${id}">${icon('clock','s18')} ${busy?'Liberar':'Marcar ocupada'}</button></div>`;
}
function kitCard(kit,i){
 const busy=kit.some(id=>state.busy.has(id)),present=hasGymKit(kit);
 const summary=busy?'Há equipamento ocupado*':present?'Configuração disponível*':'Fora da minha academia';
 return `<div class="equip-status"><div class="equip-status-head"><strong>${escapeHTML(kit.map(eqName).join(' + '))}</strong><span class="status-chip ${busy?'warn':present?'':'neutral'}">${summary}</span></div><small>Configuração ${i+1} · ${kit.length>1?'Equipamentos combinados':'Equipamento único'}</small>${kit.map(eqActions).join('')}</div>`;
}
function renderAlternatives(ex){
  const opts=availableAlternatives(ex);
  const groups=[
    {tier:0,title:'Mesmo padrão de movimento',hint:'Classificação de catálogo; não garante equivalência de carga, técnica ou estímulo.',limit:8},
    {tier:1,title:'Movimentos relacionados',hint:'Padrão próximo, mas exige avaliação das diferenças.',limit:6},
    {tier:2,title:'Outros movimentos para o músculo',hint:'Não são substituições diretas do exercício original.',limit:4}
  ];
  const renderGroup=group=>{
    const rows=opts.filter(item=>item.tier===group.tier).slice(0,group.limit);
    if(!rows.length)return '';
    return `<section class='alternative-group'><div class='sheet-section-head'><h3>${escapeHTML(group.title)}</h3><span>${rows.length} exibidos</span></div><p class='sheet-intro'>${escapeHTML(group.hint)}</p>${rows.map((entry,i)=>
      `<button class='substitute' data-action='exercise' data-id='${escapeHTML(entry.ex.id)}'><span class='sub-rank'>${i+1}</span><span class='sub-body'><span class='reason ${entry.tier===2?'different':entry.tier===1?'related':''}'>${escapeHTML(entry.label)}</span><strong>${escapeHTML(entry.ex.name)}</strong><small>${escapeHTML(entry.kit.map(eqName).join(' + '))}${entry.inGym?' · Cadastrado na minha academia':''}${entry.extraLevelWarning?' · Nível avançado':''}</small></span>${icon('chevron','s18')}</button>`
    ).join('')}</section>`;
  };
  return `<div class='sheet-section-head'><h3>Opções para continuar o treino</h3><span>${opts.length} possibilidades*</span></div>
    ${recommendationNotice()}
    ${opts.length?groups.map(renderGroup).join(''):`<div class='empty-state'>${icon('info','s28')}<strong>Sem opções com esses filtros</strong><p>Revise aparelhos ocupados, acessórios e equipamentos da sua academia.</p><button data-action='navigate' data-id='gym'>Abrir minha academia</button></div>`}`;
}
function renderExecution(ex){return `<div class="sheet-section-head"><h3>Passo a passo</h3><span>${ex.steps.length} etapas</span></div>${ex.steps.map((s,i)=>`<div class="step-row"><span class="step-number">${i+1}</span><span>${escapeHTML(s)}</span></div>`).join('')}<div class="sheet-section-head"><h3>Músculos e padrão</h3></div><p class="sheet-intro"><strong>Principais:</strong> ${escapeHTML(ex.primary.map(mName).join(', '))}.<br><strong>Secundários:</strong> ${escapeHTML(ex.secondary.map(mName).join(', ')||'Não especificados')}.<br><strong>Movimento:</strong> ${escapeHTML(pName(ex.pattern))}.</p>`;}
function exerciseSheet(ex){
 const tab=state.sheet.tab, fav=state.favorites.has(ex.id);
 return `${sheetHead('DETALHES DO EXERCÍCIO',ex.name)}<div class="sheet-scroll">${mediaGallery('exercise',ex.id,ex.name)}<div class="detail-meta">${ex.primary.map(m=>`<span class="detail-tag green">${escapeHTML(mName(m))}</span>`).join('')}<span class="detail-tag">${escapeHTML(ex.level)}</span><span class="detail-tag">${escapeHTML(ex.kind)}</span></div>
   <div class="detail-tabs" role="tablist"><button class="${tab==='alternatives'?'active':''}" data-action="detail-tab" data-id="alternatives" aria-selected="${tab==='alternatives'}">${icon('swap','s18')} Alternativas</button><button class="${tab==='steps'?'active':''}" data-action="detail-tab" data-id="steps" aria-selected="${tab==='steps'}">${icon('list','s18')} Como fazer</button></div>
   ${tab==='alternatives'?renderAlternatives(ex):renderExecution(ex)}
   <div class="sheet-section-head"><h3>Equipamentos necessários</h3><span>${ex.setups.length} ${ex.setups.length>1?'opções':'opção'}</span></div>
   ${ex.setups.map(kitCard).join('')}
   <div class="notice">${icon('info')}<span>* Status baseado em marcações manuais, não em disponibilidade em tempo real. Confira os acessórios necessários para cada movimento.</span></div>
 </div><div class="sheet-footer"><button class="primary-button full" data-action="favorite" data-id="${ex.id}">${icon('heart')} ${fav?'Remover dos salvos':'Salvar exercício'}</button></div>`;
}
function equipmentSheet(eq){
 const ex=relatedToEq(eq.id);
 return `${sheetHead(escapeHTML(eq.group).toUpperCase(),eq.name)}<div class="sheet-scroll">${mediaGallery('equipment',eq.id,eq.name)}
 <div class="detail-meta">${eq.aliases?.length?`<span class="detail-tag">Também: ${escapeHTML(eq.aliases.join(' · '))}</span>`:''}<span class="detail-tag green">${ex.length} exercícios</span></div>
 ${eq.description?`<p class="sheet-intro">${escapeHTML(eq.description)}</p>`:''}
 ${(modelsByEquipment[eq.id]||[]).length?`<div class="model-list"><strong>Modelos cadastrados</strong>${modelsByEquipment[eq.id].map(m=>`<div>${escapeHTML(m.brand)} · ${escapeHTML(m.model)}</div>`).join('')}</div>`:''}<div class="equip-status"><div class="equip-status-head"><strong>Este equipamento</strong><span class="status-chip ${state.busy.has(eq.id)?'warn':'neutral'}">${state.busy.has(eq.id)?'Ocupado*':'Sem ocupação marcada'}</span></div>${eqActions(eq.id)}</div>
 <div class="sheet-section-head"><h3>O que dá para treinar aqui?</h3><span>${ex.length} movimentos</span></div>
 ${ex.map((e,i)=>`<button class="substitute" data-action="exercise" data-id="${e.id}"><span class="sub-rank">${i+1}</span><span class="sub-body"><strong>${escapeHTML(e.name)}</strong><small>${escapeHTML(e.primary.map(mName).join(' · '))} · ${escapeHTML(pName(e.pattern))}</small></span>${icon('chevron','s18')}</button>`).join('')}
 <div class="notice">${icon('info')}<span>Os exercícios indicados são relacionados ao tipo de equipamento e precisam ser realizados com a configuração adequada. O status de ocupação é manual.</span></div></div>`;
}
function quickResults(){
 const pool=allExercises.filter(e=>find(exText(e),state.quickQuery));
 const presets=state.quickQuery?pool.slice(0,14):['legpress45','extensora_ex','supino_barra','puxada_frente','rosca_direta','agach_barra','supino_halter','legpressh'].map(id=>exercises[id]).filter(Boolean);
 const actual=presets.length?presets:(!state.quickQuery?allExercises.slice(0,8):[]);
 return `<div class="quick-list">${actual.length?actual.map(e=>`<button data-action="exercise" data-id="${e.id}">${icon('swap')}<span style="flex:1"><strong>${escapeHTML(e.name)}</strong><small>${escapeHTML(e.primary.map(mName).join(' · '))} · ${escapeHTML(excerpt(e))}</small></span>${icon('chevron','s18')}</button>`).join(''):`<div class="empty-state"><strong>Nenhum exercício encontrado</strong><p>Tente pesquisar pelo nome do movimento ou pelo músculo.</p></div>`}</div>`;
}
function quickSheet(){return `${sheetHead('ATALHO DE SUBSTITUIÇÃO','Trocar exercício')}<div class="sheet-scroll"><p class="sheet-intro">A máquina está ocupada? Selecione seu exercício atual para conhecer outras opções.</p>${recommendationNotice()}<label class="search-field sheet-search">${icon('search')}<input id="quick-search" data-input="quick" placeholder="Ex.: leg press, supino, costas" value="${escapeHTML(state.quickQuery)}" aria-label="Buscar exercício para substituir" autocomplete="off"></label><div id="quick-results">${quickResults()}</div><div class="notice">${icon('lightbulb')}<span>Você também pode marcar as máquinas ocupadas na aba Academia para aprimorar a lista de alternativas.</span></div></div>`;}
function renderSheet(preserveScroll=false){
 if(!state.sheet){root.innerHTML='';return;}
 const type=state.sheet.type;
 const old=root.querySelector('.sheet-scroll')?.scrollTop||0;
 const body=type==='exercise'?exerciseSheet(exercises[state.sheet.id]):type==='equipment'?equipmentSheet(equipment[state.sheet.id]):quickSheet();
 root.innerHTML=`<div class="sheet-overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="${type==='quick'?'Trocar exercício':'Detalhes'}">${body}</div></div>`;
 if(preserveScroll)root.querySelector('.sheet-scroll').scrollTop=old;
 q('#fab').classList.add('hide');
}
function navigate(page){if(!navItems.some(n=>n.id===page))return;closeSheet();state.page=page;state.pageSize=16;renderScreen();}
function changeMode(mode){if(!modeItems.some(m=>m.id===mode))return;state.mode=mode;state.exploreQuery='';state.pageSize=16;renderScreen();}
function refreshAfterChange(message){persist();renderScreen(true);if(state.sheet)renderSheet(true);if(message)toast(message);}
function toggleFavorite(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);refreshAfterChange(state.favorites.has(id)?'Exercício salvo nos favoritos':'Exercício removido dos favoritos');}
function toggleGym(id){if(state.gym.has(id))state.gym.delete(id);else state.gym.add(id);refreshAfterChange(state.gym.has(id)?'Equipamento adicionado à academia':'Equipamento removido da academia');}
function toggleBusy(id){if(state.busy.has(id))state.busy.delete(id);else state.busy.add(id);refreshAfterChange(state.busy.has(id)?'Equipamento marcado como ocupado':'Equipamento liberado');}
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-action]');
 if(!action)return;
 const act=action.dataset.action,id=action.dataset.id;
 switch(act){
 case 'navigate':navigate(id);break;
 case 'quick-swap':openSheet('quick');break;
 case 'close-sheet':closeSheet();break;
 case 'go-muscle':state.muscle=id;state.mode='muscle';navigate('explore');break;
 case 'go-mode':state.mode=id;navigate('explore');break;
 case 'set-mode':changeMode(id);break;
 case 'choose-muscle':state.muscle=id;state.pageSize=16;renderScreen(true);break;
 case 'choose-category':state.category=id;state.pageSize=16;renderScreen(true);break;
 case 'exercise':if(exercises[id])openSheet('exercise',id);break;
 case 'equipment':if(equipment[id])openSheet('equipment',id);break;
 case 'detail-tab':state.sheet.tab=id;renderSheet(true);break;
 case 'favorite':toggleFavorite(id);break;
 case 'toggle-gym':toggleGym(id);break;
 case 'toggle-busy':toggleBusy(id);break;
 case 'toggle-gym-only':if(!state.gymOnly && state.gym.size===0){toast('Selecione primeiro os equipamentos da sua academia');break;}state.gymOnly=!state.gymOnly;refreshAfterChange(state.gymOnly?'Filtro da academia ativado':'Mostrando todo o catálogo');break;
 case 'gym-list':state.gymList=id;renderScreen(true);break;
 case 'preset-gym':state.gym=new Set([...commonEq].filter(id=>equipment[id]));refreshAfterChange('Equipamentos comuns selecionados; revise sua academia');break;
 case 'clear-busy':state.busy.clear();refreshAfterChange('Máquinas liberadas');break;
 case 'reset-search':state.exploreQuery='';state.gymOnly=false;state.pageSize=16;refreshAfterChange();break;
 case 'load-more':state.pageSize+=16;q('#explore-results').innerHTML=resultsExplore();break;
 }
});
// Não recria o input durante a digitação: teclado, cursor e foco permanecem estáveis.
document.addEventListener('input',event=>{
 const kind=event.target.dataset.input;
 if(kind==='explore'){state.exploreQuery=event.target.value;state.pageSize=16;q('#explore-results').innerHTML=resultsExplore();}
 if(kind==='gym'){state.gymQuery=event.target.value;q('#gym-results').innerHTML=gymResults();}
 if(kind==='quick'){state.quickQuery=event.target.value;q('#quick-results').innerHTML=quickResults();}
});
root.addEventListener('click',event=>{if(event.target.classList.contains('sheet-overlay'))closeSheet();});
document.addEventListener('error', event=>{
  const target=event.target;
  if(!(target instanceof HTMLImageElement))return;
  if(target.matches('.media-thumb')){
    const fallback=document.createElement('span');
    fallback.className='media-placeholder-symbol';
    // Render an existing local SVG symbol rather than showing a broken photo.
    fallback.innerHTML=icon('gym','s28');
    target.replaceWith(fallback);
  } else if(target.matches('[data-gallery-img]')){
    const text=document.createElement('div');
    text.className='media-load-error';
    text.textContent='Imagem temporariamente indisponível';
    target.replaceWith(text);
  }
},true);

document.addEventListener('keydown',event=>{
 if(event.key==='Escape' && state.sheet){closeSheet();return;}
 if(event.key==='Tab' && state.sheet){const nodes=[...root.querySelectorAll('button:not([disabled]),input:not([disabled])')];if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
// Deslize lateral na área de resultados: alterna as abas de busca.
let swipe=null;
main.addEventListener('touchstart',e=>{if(!e.target.closest('#explore-swipes')||e.target.closest('.chips-scroll')||e.target.closest('input'))return;swipe={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
main.addEventListener('touchend',e=>{if(!swipe)return;const dx=e.changedTouches[0].clientX-swipe.x,dy=e.changedTouches[0].clientY-swipe.y;swipe=null;if(Math.abs(dx)>85 && Math.abs(dx)>Math.abs(dy)*1.5){const i=modeItems.findIndex(m=>m.id===state.mode);const next=Math.min(2,Math.max(0,i+(dx<0?1:-1)));if(next!==i)changeMode(modeItems[next].id);}},{passive:true});
// A alça do sheet permite fechá-lo com um gesto para baixo.
let sheetGesture=null;
root.addEventListener('touchstart',e=>{if(e.target.closest('#sheet-handle'))sheetGesture={y:e.touches[0].clientY};},{passive:true});
root.addEventListener('touchend',e=>{if(sheetGesture){if(e.changedTouches[0].clientY-sheetGesture.y>90)closeSheet();sheetGesture=null;}},{passive:true});
renderScreen();
// API de testes locais, sem chamadas remotas.
window.FitSwapMobileTest={DB,state,filteredExplore,filteredGym,availableAlternatives,kitAvailable,relatedToEq,navigate,openSheet,closeSheet,authorizedMedia,modelsByEquipment};
})();
