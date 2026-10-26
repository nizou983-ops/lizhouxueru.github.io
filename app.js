(()=>{
'use strict';
const DEFAULT=window.PORTFOLIO_DATA;
// 正式网站始终读取 site-data.js；只有 ?preview=1 才加载编辑器的临时草稿。
const isDraftPreview=new URLSearchParams(location.search).get('preview')==='1';
let DATA=DEFAULT;
if(isDraftPreview){try{const saved=window.localStorage.getItem('portfolio_editor_draft_v2');if(saved){const p=JSON.parse(saved);if(p?.projects?.length===4&&p.site) DATA=p;}}catch(e){}}
const previewSuffix=isDraftPreview?'?preview=1':'';
const pageHref=(slug)=>slug+'.html'+previewSuffix;
const S=DATA.site;
const pkey=document.body.dataset.page||'home';
const root=document.querySelector('#app');
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const url=(u)=>{const s=String(u||'');return (/^(https?:\/\/|mailto:|assets\/)/.test(s))?s:'#';};
const nl=(s)=>esc(s).replace(/\n/g,'<br>');
const jpg=(src,alt,cls='',extra='')=>`<img src="${attr(src)}" alt="${attr(alt)}" class="${cls}" loading="lazy" decoding="async" ${extra}>`;
// 详情页图片可放大；首页卡片保持点击进入项目的功能。
const zoomImg=(src,alt,extra='')=>`<button class="image-zoom-trigger" type="button" data-zoom-image="${attr(src)}" data-zoom-caption="${attr(alt)}" aria-label="放大查看：${attr(alt)}">${jpg(src,alt,'',extra)}<span class="image-zoom-tip" aria-hidden="true">⤢ 查看大图</span></button>`;
const header=(selected)=>`<header class="site-header"><div class="wrap header-inner"><a href="index.html${previewSuffix}" class="brand" aria-label="返回作品集首页">${esc(S.name)} <span>PORTFOLIO / 2026</span></a><nav class="nav" aria-label="主导航"><a class="${selected==='work'?'active':''}" href="index.html${previewSuffix}#work">作品</a><a class="${selected==='about'?'active':''}" href="index.html${previewSuffix}#about">关于</a><a href="index.html${previewSuffix}#contact">联系</a></nav></div></header>`;
const footer=()=>`<footer class="site-footer" id="contact"><div class="wrap footer-inner"><div><div class="section-label">CONTACT / 联系</div><p><a class="email-link" href="mailto:${attr(S.email)}">${esc(S.email)} ↗</a></p></div><div class="legal">${esc(S.footer)}</div></div></footer>`;
const cards=()=>DATA.projects.map((p)=>`<article class="work-card"><button type="button" class="work-image image-zoom-trigger ${p.slug}" data-zoom-image="${attr(p.cardImage)}" data-zoom-caption="${attr(p.name)} · 项目封面" aria-label="放大查看${attr(p.name)}封面">${jpg(p.cardImage,p.name+'项目封面')}<span class="image-zoom-tip" aria-hidden="true">⤢ 查看大图</span></button><a class="work-label" href="${pageHref(p.slug)}" aria-label="查看${attr(p.name)}项目详情"><div><h3 class="work-title">${esc(p.number)} &nbsp;${esc(p.name)}<span class="work-name-en">${esc(p.english)}</span></h3><p class="work-kind">${esc(p.category)} · ${esc(p.role)}</p></div><span class="card-arrow" aria-hidden="true">↗</span></a></article>`).join('');
const home=()=>`${header('work')}<main><section class="hero"><div class="wrap"><div class="kicker">${esc(S.heroKicker)}</div><h1>${nl(S.heroTitle)}</h1><div class="hero-bottom"><div><div class="english">${esc(S.heroSubtitle)}</div><p class="hero-desc">${esc(S.heroDesc)}</p></div><div class="scrollhint" aria-hidden="true">EXPLORE WORK</div></div></div></section><section class="works wrap" id="work"><div class="section-head"><h2>精选项目 <small>SELECTED WORKS</small></h2><span class="section-count">01 — 04</span></div><div class="work-grid">${cards()}</div></section><section class="about" id="about"><div class="wrap about-grid"><div class="about-left"><h2>${esc(S.aboutTitle)}</h2><div class="section-label">ABOUT / PROFILE</div></div><div class="about-right"><p>${esc(S.aboutText)}</p><p class="research">${esc(S.aboutResearch)}</p><div class="edu"><span>${esc(S.school1)}</span><span>${esc(S.school2)}</span></div></div></div></section></main>${footer()}${imageModal()}`;
function buttons(p){return (p.buttons||[]).map((b,i)=>{
 const href=url(b.url),isPdf=b.kind==='pdf';
 if(isPdf){return `<button class="action-btn ${i===0?'strong':''}" type="button" data-pdf="${attr(href)}" data-pdf-title="${attr(b.title)}">${esc(b.title)} <span aria-hidden="true">↗</span></button>`;}
 return `<a class="action-btn ${i===0?'strong':''}" href="${attr(href)}" target="_blank" rel="noopener noreferrer">${esc(b.title)} <span aria-hidden="true">↗</span></a>`;
}).join('');}
function detail(p){
 const idx=DATA.projects.findIndex(x=>x.slug===p.slug);
 const next=DATA.projects[(idx+1)%DATA.projects.length];
 const last=DATA.projects[(idx+DATA.projects.length-1)%DATA.projects.length];
 const cover=`<figure class="detail-cover ${p.slug}">${zoomImg(p.heroImage,p.heroLabel,'loading="eager" fetchpriority="high"')}</figure><div class="caption">${esc(p.heroLabel)}</div>`;
 const video=p.video?`<div class="media-area"><h2 class="subheading">FILM TRAILER / 预告片</h2><video controls preload="metadata" playsinline poster="${attr(p.heroImage)}"><source src="${attr(p.video)}" type="video/mp4">你的浏览器不支持内嵌视频。<a href="${attr(p.video)}">打开视频文件</a></video><p class="video-caption">${esc(p.bottomNote||'')}</p></div>`:'';
 const sections=(p.sections||[]).map((s,i)=>`<section class="project-section"><div><div class="number">${String(i+1).padStart(2,'0')} / ${String(p.sections.length).padStart(2,'0')}</div><h3>${esc(s.title)}</h3></div><div class="copy">${(s.paragraphs||[]).map(x=>`<p>${esc(x)}</p>`).join('')}${s.image?`<div class="section-image">${zoomImg(s.image,s.imageCaption||s.title)}</div><p class="caption">${esc(s.imageCaption||'')}</p>`:''}</div></section>`).join('');
 const gallery=(p.gallery||[]).length?`<section class="gallery">${p.gallery.map(i=>`<figure>${zoomImg(i.src,i.caption)}<figcaption>${esc(i.caption)}</figcaption></figure>`).join('')}</section>`:'';
 const note=p.slug==='ark'?'':`<p class="note">${esc(p.bottomNote||'')}</p>`;
 return `${header('work')}<main class="wrap detail"><a class="back-link" href="index.html${previewSuffix}#work">← &nbsp; 返回所有项目</a><section class="detail-head"><div class="eyebrow">PROJECT ${esc(p.number)} &nbsp; / &nbsp; ${esc(p.category)}</div><h1>${esc(p.name)}</h1><div class="detail-en">${esc(p.english)}</div><div class="detail-meta"><div class="meta-item"><span class="meta-label">项目类型</span><span class="meta-value">${esc(p.category)}</span></div><div class="meta-item"><span class="meta-label">我的职责</span><span class="meta-value">${esc(p.role)}</span></div><div class="meta-item"><span class="meta-label">时间</span><span class="meta-value">${esc(p.date)}</span></div></div></section>${cover}<section class="detail-intro"><div><h2>PROJECT OVERVIEW<br>项目简介</h2><div class="stat-row">${(p.stats||[]).map(x=>`<span class="stat">${esc(x)}</span>`).join('')}</div></div><p>${esc(p.intro)}</p></section>${video}<div class="section-head"><h2>项目实践 <small>PROCESS & CONTRIBUTIONS</small></h2><span class="section-count">${String(p.sections?.length||0).padStart(2,'0')} SECTIONS</span></div>${sections}${gallery}<section class="action-panel"><div><div class="section-label">EXPLORE MORE</div><h2>查看完整作品与资料</h2></div><div class="action-buttons">${buttons(p)}</div></section>${note}<div class="next-project"><div><span>PREVIOUS</span><div><a href="${attr(pageHref(last.slug))}">← ${esc(last.name)}</a></div></div><div style="text-align:right"><span>NEXT PROJECT</span><div><a href="${attr(pageHref(next.slug))}">${esc(next.name)} →</a></div></div></div></main>${footer()}${pdfModal()}${imageModal()}`;
}
// 网站仅加载PDF预览页的图片，不直接嵌入或下载源PDF。
// 源PDF文件无需上传网站，正式发布前请删除 assets 下原PDF，以减少直接下载风险。
const PDF_PREVIEWS={
 'assets/father-portfolio.pdf':{folder:'father',pages:7},
 'assets/river-portfolio.pdf':{folder:'river',pages:4},
 'assets/xr-excerpt-public.pdf':{folder:'xr',pages:16}
};
function pdfModal(){return `<dialog class="pdf-modal" id="pdfModal" aria-label="在线文档预览"><div class="pdf-bar"><span id="pdfTitle">在线文档预览</span><div class="pdf-toolbar"><button type="button" data-pdf-prev aria-label="上一页">‹</button><span id="pdfPageCount" aria-live="polite">1 / 1</span><button type="button" data-pdf-next aria-label="下一页">›</button><span class="pdf-separator" aria-hidden="true"></span><button type="button" data-pdf-zoom-out aria-label="缩小">−</button><span id="pdfZoomLabel">100%</span><button type="button" data-pdf-zoom-in aria-label="放大">+</button><button type="button" data-close-pdf aria-label="关闭预览">×</button></div></div><div class="pdf-reader" id="pdfReader"><div class="pdf-page-inner"><img id="pdfPageImage" alt="文档页面" draggable="false"></div><p class="pdf-reader-error" id="pdfError" hidden>此文档尚未生成在线预览图片。请重新制作对应的预览页。</p></div><div class="pdf-info">在线阅读预览 · 文档已添加水印 · 不提供下载或打印入口</div></dialog>`;}
function imageModal(){return `<dialog class="image-modal" id="imageModal" aria-label="图片放大查看"><div class="image-bar"><span id="imageCaption"></span><div class="image-toolbar"><button type="button" data-image-prev aria-label="上一张图片">‹</button><span id="imagePosition"></span><button type="button" data-image-next aria-label="下一张图片">›</button><span class="image-separator"></span><button type="button" data-image-zoom-out aria-label="缩小图片">−</button><span id="imageZoomLabel">100%</span><button type="button" data-image-zoom-in aria-label="放大图片">+</button><button type="button" data-close-image aria-label="关闭图片">×</button></div></div><div class="image-stage" id="imageStage"><div class="image-stage-inner"><img id="imageLarge" alt="放大图片" draggable="false"></div></div><div class="image-tip">滚轮缩放 · 左右方向键切换 · Esc关闭</div></dialog>`;}
const project=DATA.projects.find(x=>x.slug===pkey);
root.innerHTML=(pkey==='home'||!project)?home():detail(project);
document.title=project?`${project.name}｜${project.english} - ${S.name} 作品集`:`${S.name}｜影视与跨媒介项目作品集`;
// 文件缺失时显示明确提示，避免网页出现无说明的空白。
document.querySelectorAll('#app img').forEach(img=>{
 const showMissing=()=>{
  if(img.dataset.missing==='1')return;
  img.dataset.missing='1';
  const msg=document.createElement('span');msg.className='missing-image';msg.textContent='图片未找到：'+img.getAttribute('src');
  img.insertAdjacentElement('afterend',msg);
 };
 img.addEventListener('error',showMissing);
 if(img.complete&&img.naturalWidth===0)showMissing();
});
// 统一弹窗逻辑，兼容直接从本地 file:// 打开。
function openDialog(dialog){if(!dialog)return; if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.classList.add('modal-open');}
function closeDialog(dialog){if(!dialog)return; if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('modal-open');}

const pdfDialog=document.querySelector('#pdfModal');
let pdfState=null;
let pdfZoom=1;
let pdfPage=0;
if(pdfDialog){
 const reader=pdfDialog.querySelector('#pdfReader');
 const preview=pdfDialog.querySelector('#pdfPageImage');
 const counter=pdfDialog.querySelector('#pdfPageCount');
 const error=pdfDialog.querySelector('#pdfError');
 const zoomCounter=pdfDialog.querySelector('#pdfZoomLabel');
 function fitPdf(){if(!pdfState)return;const base=Math.min(1150,Math.max(240,reader.clientWidth-44));preview.style.width=Math.round(base*pdfZoom)+'px';zoomCounter.textContent=Math.round(pdfZoom*100)+'%';}
 function updatePdf(){
  if(!pdfState)return;
  pdfPage=Math.max(0,Math.min(pdfPage,pdfState.pages-1));
  const file=`assets/pdf-pages/${pdfState.folder}/page-${String(pdfPage+1).padStart(2,'0')}.jpg`;
  error.hidden=true;preview.hidden=false;preview.alt=`文档第${pdfPage+1}页`;
  preview.src=file;counter.textContent=`${pdfPage+1} / ${pdfState.pages}`;
  pdfDialog.querySelector('[data-pdf-prev]').disabled=pdfPage===0;
  pdfDialog.querySelector('[data-pdf-next]').disabled=pdfPage===pdfState.pages-1;
  fitPdf();reader.scrollTo(0,0);
 }
 preview.addEventListener('error',()=>{preview.hidden=true;error.hidden=false;});
 document.addEventListener('click',e=>{
  const open=e.target.closest('[data-pdf]');
  if(open){
   const key=open.getAttribute('data-pdf');pdfState=PDF_PREVIEWS[key]||null;
   pdfDialog.querySelector('#pdfTitle').textContent=open.getAttribute('data-pdf-title')||'在线预览';
   if(!pdfState){openDialog(pdfDialog);preview.hidden=true;error.hidden=false;counter.textContent='—';return;}
   pdfPage=0;pdfZoom=1;openDialog(pdfDialog);updatePdf();return;
  }
  if(!pdfDialog.open)return;
  if(e.target.closest('[data-close-pdf]'))closeDialog(pdfDialog);
  else if(e.target.closest('[data-pdf-prev]')){pdfPage--;updatePdf();}
  else if(e.target.closest('[data-pdf-next]')){pdfPage++;updatePdf();}
  else if(e.target.closest('[data-pdf-zoom-in]')){pdfZoom=Math.min(3.0,Math.round((pdfZoom+.25)*100)/100);fitPdf();}
  else if(e.target.closest('[data-pdf-zoom-out]')){pdfZoom=Math.max(.5,Math.round((pdfZoom-.25)*100)/100);fitPdf();}
 });
 pdfDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open'); preview.removeAttribute('src');});
 pdfDialog.addEventListener('click',e=>{if(e.target===pdfDialog)closeDialog(pdfDialog);});
 reader.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('keydown',e=>{
  if(!pdfDialog.open)return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();pdfPage++;updatePdf();}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();pdfPage--;updatePdf();}
 });
 window.addEventListener('resize',()=>{if(pdfDialog.open)fitPdf();});
}

const imageDialog=document.querySelector('#imageModal');
const images=[...document.querySelectorAll('[data-zoom-image]')];
let imageIndex=0,imageZoom=1;
if(imageDialog){
 const stage=imageDialog.querySelector('#imageStage');
 const large=imageDialog.querySelector('#imageLarge');
 function fitImage(){const base=Math.min(stage.clientWidth-50,large.naturalWidth||1200,1380);large.style.width=Math.round(Math.max(100,base)*imageZoom)+'px';imageDialog.querySelector('#imageZoomLabel').textContent=Math.round(imageZoom*100)+'%';}
 function updateImage(){
  const active=images[imageIndex]; if(!active)return;
  large.src=active.dataset.zoomImage;large.alt=active.dataset.zoomCaption||'作品图片';
  imageDialog.querySelector('#imageCaption').textContent=active.dataset.zoomCaption||'作品图片';
  imageDialog.querySelector('#imagePosition').textContent=`${imageIndex+1} / ${images.length}`;
  imageDialog.querySelector('[data-image-prev]').disabled=imageIndex===0;
  imageDialog.querySelector('[data-image-next]').disabled=imageIndex===images.length-1;
  fitImage();stage.scrollTo(0,0);
 }
 function setZoom(z){imageZoom=Math.max(.5,Math.min(4,Math.round(z*100)/100));fitImage();}
 large.addEventListener('load',fitImage);
 large.addEventListener('error',()=>{imageDialog.querySelector('#imageCaption').textContent='无法读取图片：'+large.getAttribute('src');});
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-zoom-image]');
  if(trigger){imageIndex=images.indexOf(trigger);imageZoom=1;openDialog(imageDialog);updateImage();return;}
  if(!imageDialog.open)return;
  if(e.target.closest('[data-close-image]'))closeDialog(imageDialog);
  else if(e.target.closest('[data-image-prev]')){imageIndex=Math.max(0,imageIndex-1);imageZoom=1;updateImage();}
  else if(e.target.closest('[data-image-next]')){imageIndex=Math.min(images.length-1,imageIndex+1);imageZoom=1;updateImage();}
  else if(e.target.closest('[data-image-zoom-in]'))setZoom(imageZoom+.25);
  else if(e.target.closest('[data-image-zoom-out]'))setZoom(imageZoom-.25);
 });
 stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(imageZoom+(e.deltaY<0?.15:-.15));},{passive:false});
 imageDialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
 imageDialog.addEventListener('click',e=>{if(e.target===imageDialog)closeDialog(imageDialog);});
 stage.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('keydown',e=>{
  if(!imageDialog.open)return;
  if(e.key==='ArrowRight'){e.preventDefault();imageIndex=Math.min(images.length-1,imageIndex+1);imageZoom=1;updateImage();}
  else if(e.key==='ArrowLeft'){e.preventDefault();imageIndex=Math.max(0,imageIndex-1);imageZoom=1;updateImage();}
 });
 window.addEventListener('resize',()=>{if(imageDialog.open)fitImage();});
}
})();
