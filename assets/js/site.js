/* StudyHub | Shared rendering and filtering logic. Keep this data-driven. */
'use strict';
const CATEGORY_META = Object.freeze({
  cs: {label:'計算機概論', short:'計概', icon:'◈', accent:'violet'},
  ds: {label:'資料結構與演算法', short:'資結', icon:'⌘', accent:'pink'},
  ai: {label:'AI 與研究筆記', short:'AI × 研究', icon:'✦', accent:'mint'}
});
// Use textContent or escapeHtml for user-data fields: never insert raw content as HTML.
const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeId = (v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v || '') ? v : '';
const urlFor = note => `article.html?id=${encodeURIComponent(note.id)}`;
const getNotes = async () => {
  const response = await fetch('data/notes.json', {cache:'no-cache'});
  if (!response.ok) throw new Error('無法讀取筆記資料');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('筆記資料格式錯誤');
  return data;
};
function setTheme(next) {
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('studyhub-theme', next); } catch (_) { /* optional */ }
  document.querySelectorAll('#theme-toggle').forEach(button => button.textContent = next === 'dark' ? '☀' : '☾');
}
function initTheme() {
  let theme = 'light';
  try { theme = localStorage.getItem('studyhub-theme') || 'light'; } catch (_) { /* optional */ }
  setTheme(theme === 'dark' ? 'dark' : 'light');
  document.querySelector('#theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}
function renderCard(n) {
  const category = CATEGORY_META[n.category] || CATEGORY_META.cs;
  const tags = (n.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  return `<a class="note-card" href="${urlFor(n)}" aria-label="閱讀：${escapeHtml(n.title)}"><div class="card-top"><span class="category-icon ${category.accent}">${escapeHtml(category.icon)}</span><span class="card-meta">${escapeHtml(n.minutes)} MIN READ</span></div><div class="card-category">${escapeHtml(category.label)} · ${escapeHtml(n.level)}</div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.summary)}</p><div class="tag-row">${tags}</div><div class="card-bottom"><span>閱讀筆記</span><span class="card-arrow" aria-hidden="true">↗</span></div></a>`;
}
function initHome(notes) {
  document.querySelector('#count-notes').textContent = notes.length;
  document.querySelector('#count-categories').textContent = new Set(notes.map(n=>n.category)).size;
  document.querySelector('#count-sections').textContent = notes.reduce((sum,n)=>sum+(n.sections?.length||0),0);
  const params = new URLSearchParams(location.search);
  let selected = CATEGORY_META[params.get('category')] ? params.get('category') : 'all';
  let query = '';
  const input = document.querySelector('#note-search');
  const grid = document.querySelector('#notes-grid');
  const empty = document.querySelector('#empty-state');
  function paint() {
    const q = query.trim().toLocaleLowerCase('zh-Hant');
    const subset = notes.filter(n => {
      if (selected !== 'all' && n.category !== selected) return false;
      if (!q) return true;
      const searchable = [n.title,n.subtitle,n.summary,n.category,n.level,n.source,...(n.tags||[]),...(n.sections||[]).flatMap(s=>[s.heading,...(s.paragraphs||[]),...(s.bullets||[])])].join(' ').toLocaleLowerCase('zh-Hant');
      return searchable.includes(q);
    });
    document.querySelectorAll('[data-category]').forEach(el => {
      const active = el.dataset.category === selected;
      el.classList.toggle('active',active);
      el.classList.toggle('selected',active && el.classList.contains('side-link'));
      el.setAttribute('aria-pressed',String(active));
    });
    grid.innerHTML = subset.map(renderCard).join('');
    document.querySelector('#result-count').textContent = `共 ${subset.length} 篇筆記`;
    empty.hidden = subset.length > 0;
  }
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.category;
    const u = new URL(location.href);
    if (selected === 'all') u.searchParams.delete('category'); else u.searchParams.set('category',selected);
    history.replaceState({},'',u);
    paint();
  }));
  input.addEventListener('input',event=>{query=event.target.value; paint();});
  document.addEventListener('keydown',event=>{
    if (event.key==='/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {event.preventDefault();input.focus();}
  });
  document.querySelector('#reset-search').addEventListener('click',()=>{input.value='';query='';selected='all';history.replaceState({},'',location.pathname);paint();input.focus();});
  paint();
}
function tableHtml(t) {
  if (!t?.headers || !t?.rows) return '';
  return `<div class="table-scroll"><table><thead><tr>${t.headers.map(c=>`<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map(c=>`<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function sectionHtml(s,index) {
  const paragraphs=(s.paragraphs||[]).map(p=>`<p>${escapeHtml(p)}</p>`).join('');
  const bullets=s.bullets?.length ? `<ul>${s.bullets.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul>` : '';
  const code=typeof s.code==='string' ? `<div class="code-title"><span class="code-dot"></span><span>CODE EXAMPLE</span><button type="button" class="copy-code" data-code="${index}">複製程式碼</button></div><pre><code>${escapeHtml(s.code)}</code></pre>` : '';
  const example= s.example ? `<div class="example-box"><span class="example-label">✦ EXAMPLE / NOTE</span><p>${escapeHtml(s.example)}</p></div>` : '';
  return `<section id="section-${index+1}" class="article-section"><div class="article-section-number">${String(index+1).padStart(2,'0')} /</div><h2>${escapeHtml(s.heading)}</h2>${paragraphs}${bullets}${tableHtml(s.table)}${code}${example}</section>`;
}
function initArticle(notes) {
  const id=safeId(new URLSearchParams(location.search).get('id'));
  const note=notes.find(n=>n.id===id);
  const root=document.querySelector('#article-root');
  if(!note){document.title='找不到筆記 — StudyHub';root.innerHTML='<div class="not-found"><h1>找不到這篇筆記</h1><p>請返回首頁選擇其他主題。</p><a href="index.html" class="hero-cta">回到首頁 →</a></div>';return;}
  const meta=CATEGORY_META[note.category]||CATEGORY_META.cs;
  document.title=`${note.title} — StudyHub`;
  document.querySelector('#article-category-link').textContent=meta.label;
  document.querySelector('#article-category-link').href=`index.html?category=${note.category}`;
  document.querySelector('#breadcrumb-title').textContent=note.title;
  root.innerHTML=`<header class="article-header"><span class="category-label">${escapeHtml(meta.icon)} ${escapeHtml(meta.label)}</span><h1>${escapeHtml(note.title)}</h1><p class="article-subtitle">${escapeHtml(note.subtitle)}</p><div class="article-meta"><span>◷ ${escapeHtml(note.minutes)} 分鐘閱讀</span><span>✧ ${escapeHtml(note.level)}</span><span>▤ ${escapeHtml(note.sections.length)} 個章節</span></div></header><div class="article-summary"><strong>這篇筆記會學到什麼？</strong><p>${escapeHtml(note.summary)}</p></div><nav class="toc" aria-label="本文目錄"><div class="toc-title">CONTENTS / 本文目錄</div><ol>${note.sections.map((s,i)=>`<li><a href="#section-${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${escapeHtml(s.heading)}</a></li>`).join('')}</ol></nav><div class="article-body">${note.sections.map(sectionHtml).join('')}</div><div class="source-box"><span>▣  SOURCE & QUALITY</span><p>整理來源：${escapeHtml(note.source)}（${escapeHtml(note.sourceType)}）。本文為重新撰寫的學習整理，非原始 PDF 全文。辨識不清與尚未核實的原始數據，請以原筆記與研究程式確認。</p></div><div class="article-end"><span>學完這篇了嗎？</span><button type="button" id="share-note">複製文章連結 ↗</button></div>`;
  root.querySelectorAll('.copy-code').forEach(btn => btn.addEventListener('click',async()=>{
    const c=note.sections[Number(btn.dataset.code)]?.code;
    if(!c)return; try{await navigator.clipboard.writeText(c);btn.textContent='已複製 ✓';}catch(_){btn.textContent='請手動選取程式碼';}
  }));
  document.querySelector('#share-note').addEventListener('click',async e=>{
    try{await navigator.clipboard.writeText(location.href);e.currentTarget.textContent='已複製連結 ✓';}catch(_){e.currentTarget.textContent='請使用瀏覽器複製網址';}
  });
  const related=notes.filter(n=>n.category===note.category&&n.id!==note.id).slice(0,2);
  document.querySelector('#article-navigation').innerHTML=`<h2>同類別延伸閱讀</h2><div class="related-grid">${related.map(n=>`<a class="related-link" href="${urlFor(n)}"><span>${escapeHtml(n.title)}</span><strong>閱讀文章 ↗</strong></a>`).join('')}</div>`;
}
document.addEventListener('DOMContentLoaded',async()=>{
  initTheme();
  const page=document.body.dataset.page;
  if(page==='about') return;
  try{
    const notes=await getNotes();
    if(page==='home') initHome(notes); else if(page==='article') initArticle(notes);
  }catch(error){
    const target=document.querySelector('#notes-grid')||document.querySelector('#article-root');
    if(target) target.innerHTML='<div class="error-state"><h2>暫時無法載入筆記</h2><p>請透過網頁伺服器開啟網站（例如 GitHub Pages，或本機執行 python -m http.server）。</p></div>';
    const c=document.querySelector('#result-count');if(c)c.textContent='載入失敗';
    console.error(error);
  }
});
