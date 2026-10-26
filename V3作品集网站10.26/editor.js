(()=>{
'use strict';
// 正式网页只读取 site-data.js。编辑器的草稿仅用于带 ?preview=1 的预览。
const KEY='portfolio_editor_draft_v2';
const OLD_KEY='portfolio_editor_v1';
const clone=o=>JSON.parse(JSON.stringify(o));
const AUTH=clone(window.PORTFOLIO_DATA);
let model=clone(AUTH);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=d=>d&&d.site&&Array.isArray(d.projects)&&d.projects.length===4;
try{const draft=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(draft))model=draft;}catch(e){}
const field=(label,path,value,multiline=false,wide=false,hint='',type='text')=>`<div class="field ${wide?'wide':''}"><label for="${path}">${esc(label)}</label>${multiline?`<textarea id="${path}" data-path="${path}" rows="${Math.min(9,Math.max(3,String(value??'').split('\n').length+1))}">${esc(value)}</textarea>`:`<input id="${path}" data-path="${path}" type="text" value="${esc(value)}" spellcheck="false">`}${hint?`<div class="editor-hint">${esc(hint)}</div>`:''}${type==='image'?`<div class="image-preview" data-preview="${path}"><img alt="文件预览" loading="lazy"><span class="image-status" aria-live="polite"></span></div>`:''}</div>`;
const fields=a=>`<div class="editor-fields">${a.join('')}</div>`;
const imageField=(label,path,v)=>field(label,path,v,false,false,'图片放入 assets 文件夹；保留其真实后缀 .jpg / .png / .webp；大小写要完全一致。','image');
function render(){
 const site=model.site;
 let html=`<div class="editor-panel"><h2>首页与联系信息</h2>${fields([
 field('网站展示姓名','site.name',site.name),field('联系邮箱','site.email',site.email),
 field('主标题（可换行）','site.heroTitle',site.heroTitle,true,true),
 field('英文副标题','site.heroSubtitle',site.heroSubtitle),
 field('首页上方英文标签','site.heroKicker',site.heroKicker),
 field('首页介绍','site.heroDesc',site.heroDesc,true,true),
 field('关于我的第一段','site.aboutText',site.aboutText,true,true),
 field('硕士研究介绍','site.aboutResearch',site.aboutResearch,true,true),
 field('教育经历A','site.school1',site.school1),field('教育经历B','site.school2',site.school2)
 ])}</div>`;
 for(let i=0;i<model.projects.length;i++){
  const p=model.projects[i];const gallery=p.gallery||[];
  html+=`<div class="editor-panel"><h2>${esc(p.number)} · ${esc(p.name)}</h2>${fields([
    field('中文项目名',`projects.${i}.name`,p.name),field('英文名称',`projects.${i}.english`,p.english),
    field('项目类别',`projects.${i}.category`,p.category),field('实际职责',`projects.${i}.role`,p.role),
    field('项目时间',`projects.${i}.date`,p.date),imageField('详情页封面路径',`projects.${i}.heroImage`,p.heroImage),
    imageField('首页卡片图片路径',`projects.${i}.cardImage`,p.cardImage),
    field('首页项目简介',`projects.${i}.summary`,p.summary,true,true),
    field('项目简介',`projects.${i}.intro`,p.intro,true,true),
    field('项目指标（每行一条）',`projects.${i}.stats`,(p.stats||[]).join('\n'),true,true),
    ...(p.sections||[]).flatMap((s,j)=>[
     field(`段落 ${j+1} · 小标题`,`projects.${i}.sections.${j}.title`,s.title),
     imageField(`段落 ${j+1} · 配图文件`,`projects.${i}.sections.${j}.image`,s.image||''),
     field(`段落 ${j+1} · 文字（段落间留空行）`,`projects.${i}.sections.${j}.paragraphs`,(s.paragraphs||[]).join('\n\n'),true,true)
    ]),
    ...(p.buttons||[]).flatMap((b,j)=>[
      field(`按钮 ${j+1} · 名称`,`projects.${i}.buttons.${j}.title`,b.title),
      field(`按钮 ${j+1} · 链接`,`projects.${i}.buttons.${j}.url`,b.url)
    ]),
    ...(p.video!==undefined?[field('预告片路径',`projects.${i}.video`,p.video)]:[]),
    field('页面底部说明',`projects.${i}.bottomNote`,p.bottomNote||'',true,true)
   ])}
   <div class="gallery-editor"><h3>项目附加图片 <small>（可新增或删除，将显示在详情页下方）</small></h3>
   ${gallery.map((g,j)=>`<div class="gallery-editor-item"><div class="editor-fields">
      ${imageField(`附加图片 ${j+1} · 路径`,`projects.${i}.gallery.${j}.src`,g.src||'')}
      ${field(`附加图片 ${j+1} · 说明`,`projects.${i}.gallery.${j}.caption`,g.caption||'')}
     </div><button type="button" data-remove-gallery="${i}:${j}">删除这张附加图片</button></div>`).join('')}
   <button type="button" class="gallery-add" data-add-gallery="${i}">＋ 添加一张图片</button>
   </div></div>`;
 }
 $('#editorForms').innerHTML=html;
 document.querySelectorAll('.image-preview').forEach(preview=>updateImagePreview(preview));
}
function getValue(path){const parts=path.split('.');let x=model;for(const p of parts){if(x===undefined||x===null)return '';x=x[p];}return x;}
function setValue(path,value){const parts=path.split('.');let obj=model;for(let i=0;i<parts.length-1;i++)obj=obj[parts[i]];
 const k=parts.at(-1); if(k==='paragraphs')obj[k]=value.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 else if(k==='stats')obj[k]=value.split('\n').map(x=>x.trim()).filter(Boolean);else obj[k]=value;}
function updateImagePreview(preview){
 const path=preview.dataset.preview;const raw=String(getValue(path)||'').trim();const img=preview.querySelector('img');const status=preview.querySelector('.image-status');
 img.onload=null;img.onerror=null; img.removeAttribute('src');img.hidden=true;
 if(!raw){status.textContent='未填写图片路径';status.className='image-status';return;}
 if(!/^assets\/.+\.(webp|png|jpe?g|gif|avif)$/i.test(raw) || raw.includes('..')){
  status.textContent='路径不符合预期。示例：assets/my-photo.webp（也可以是 .jpg / .png）';status.className='image-status bad';return;
 }
 status.textContent='检查图片文件…';status.className='image-status';
 img.onload=()=>{img.hidden=false;status.textContent='✓ 图片可读取';status.className='image-status good';};
 img.onerror=()=>{img.hidden=true;status.textContent='✕ 无法找到或读取：'+raw+'。请检查文件实际名称、位置和格式；不要只重命名扩展名。';status.className='image-status bad';};
 img.src=raw;
}
let toastTimer;
function toast(msg){const box=$('#toast');box.textContent=msg;box.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('show'),3400);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(model));toast('草稿已保存。点击“预览草稿”可查看未导出的效果。');return true;}catch(err){toast('本地保存不可用，请直接导出 site-data.js。');return false;}}
function download(content,name,type){const blob=new Blob([content],{type});const blobUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=blobUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),4000);}
$('#editorForms').addEventListener('input',e=>{const k=e.target.dataset.path;if(k){setValue(k,e.target.value);const pr=e.target.closest('.field').querySelector('.image-preview');if(pr){clearTimeout(pr._timer);pr._timer=setTimeout(()=>updateImagePreview(pr),360);}}});
$('#editorForms').addEventListener('click',e=>{
 const add=e.target.closest('[data-add-gallery]');if(add){const i=Number(add.dataset.addGallery);model.projects[i].gallery??=[];model.projects[i].gallery.push({src:'',caption:''});render();toast('已增加图片位置。请填写 assets/图片文件名，然后导出新的 JS。');return;}
 const del=e.target.closest('[data-remove-gallery]');if(del){const [i,j]=del.dataset.removeGallery.split(':').map(Number);model.projects[i].gallery.splice(j,1);render();toast('已删除该附加图片。');}
});
$('#saveEdit').addEventListener('click',save);
$('#previewDraft').addEventListener('click',()=>{save();window.open('index.html?preview=1','_blank','noopener');});
$('#exportJs').addEventListener('click',()=>{save();download('/* 作品集网站正式内容 · 由编辑器导出 */\nwindow.PORTFOLIO_DATA = '+JSON.stringify(model,null,2)+';\n','site-data.js','text/javascript;charset=utf-8');toast('已导出 site-data.js：请替换网站文件夹根目录的同名文件，并正常打开 index.html。');});
$('#exportJson').addEventListener('click',()=>download(JSON.stringify(model,null,2),'作品集_编辑备份.json','application/json;charset=utf-8'));
$('#importJson').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!valid(obj))throw Error('文件结构不完整');model=clone(obj);save();render();toast('备份导入成功，可继续修改或导出JS。');}catch(err){alert('不是有效的作品集JSON备份：'+err.message);}e.target.value='';});
$('#resetEdit').addEventListener('click',()=>{if(confirm('从当前 site-data.js 重新载入？这会放弃尚未导出的草稿。')){localStorage.removeItem(KEY);model=clone(AUTH);render();toast('已读取当前 site-data.js 内容。');}});
$('#oldDraft').addEventListener('click',()=>{try{const prev=JSON.parse(localStorage.getItem(OLD_KEY)||'null');if(!valid(prev))throw Error('没有可用旧草稿');if(confirm('读取旧版编辑器草稿并覆盖当前未导出的编辑内容？')){model=clone(prev);save();render();}}catch(e){toast('没有发现旧版草稿。');}});
render();
})();
