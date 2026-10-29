(()=>{'use strict';if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
const cursor=document.createElement('div');cursor.className='pawomi-hand-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
const supportsPopover=typeof cursor.showPopover==='function';
if(supportsPopover)cursor.setAttribute('popover','manual');
let x=-200,y=-200,visible=false,layer=null;
function refreshLayer(){
 const dialogs=[...document.querySelectorAll('dialog[open]')];
 const modal=dialogs.reverse().find(el=>{try{return el.matches(':modal')}catch{return false}});
 if(supportsPopover){
  // A modal dialog is in the browser top layer. The cursor popover must be
  // raised AFTER showModal(), otherwise it remains underneath the dialog.
  if(modal!==layer || !cursor.matches(':popover-open')){
   if(cursor.matches(':popover-open'))cursor.hidePopover();
   try{cursor.showPopover()}catch{if(modal)modal.append(cursor);else document.body.append(cursor)}
   layer=modal||null;
  }
 }else{
  const host=modal||document.body;
  if(cursor.parentNode!==host)host.append(cursor);
  layer=modal||null;
 }
}
function show(e){refreshLayer();x=e.clientX;y=e.clientY;cursor.style.left=x+'px';cursor.style.top=y+'px';if(!visible){cursor.classList.add('is-visible');visible=true}}
function hide(){cursor.classList.remove('is-visible');visible=false;cursor.classList.remove('is-clicking')}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;show(e);const el=document.elementFromPoint(e.clientX,e.clientY);cursor.classList.toggle('is-text',!!el?.closest('input,textarea,[contenteditable="true"],select'))},{passive:true});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')cursor.classList.add('is-clicking')},{passive:true});
document.addEventListener('pointerup',()=>cursor.classList.remove('is-clicking'),{passive:true});
document.addEventListener('pointercancel',hide,{passive:true});
document.addEventListener('mouseleave',hide);
window.addEventListener('blur',hide);
document.addEventListener('close',refreshLayer,true);
new MutationObserver(()=>refreshLayer()).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
refreshLayer();
})();