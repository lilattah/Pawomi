(()=>{'use strict';if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
const cursor=document.createElement('div');cursor.className='pawomi-hand-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
let x=-200,y=-200,visible=false;
function show(e){x=e.clientX;y=e.clientY;cursor.style.left=x+'px';cursor.style.top=y+'px';if(!visible){cursor.classList.add('is-visible');visible=true}}
function hide(){cursor.classList.remove('is-visible');visible=false;cursor.classList.remove('is-clicking')}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;show(e);const el=document.elementFromPoint(e.clientX,e.clientY);cursor.classList.toggle('is-text',!!el?.closest('input,textarea,[contenteditable="true"],select'))},{passive:true});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')cursor.classList.add('is-clicking')},{passive:true});
document.addEventListener('pointerup',()=>cursor.classList.remove('is-clicking'),{passive:true});
document.addEventListener('pointercancel',hide,{passive:true});
document.addEventListener('mouseleave',hide);
window.addEventListener('blur',hide);
})();