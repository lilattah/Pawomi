/* Pawomi Hero Chase — four-direction 6x4 sprite movement, paired collision-free steering */
(()=>{'use strict';
function boot(){
document.querySelectorAll('.hero.red-section').forEach(hero=>{
 if(hero.dataset.pawomiGame)return;hero.dataset.pawomiGame='1';
 const canvas=document.createElement('canvas');canvas.className='pawomi-chase-canvas';canvas.setAttribute('aria-hidden','true');hero.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const urls=hero.dataset.gameBase||'./';
 const actors=[
  {name:'dog',src:urls+'pawomi-game-dog.png',x:.70,y:.52,vx:0,vy:0,size:128,phase:0,ready:false},
  {name:'cat',src:urls+'pawomi-game-cat.png',x:.82,y:.52,vx:0,vy:0,size:128,phase:2,ready:false}
 ];
 const pointer={x:.77,y:.53,active:false};
 let w=1,h=1,dpr=1,last=0,elapsed=0;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function resize(){
  const r=hero.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
  dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 function makeTransparent(img){
  const off=document.createElement('canvas');off.width=img.naturalWidth;off.height=img.naturalHeight;
  const g=off.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);let data;
  try{data=g.getImageData(0,0,off.width,off.height)}catch{return off}
  const arr=data.data;
  // Only remove dark low-saturation backdrop. Keep black ink pixels; preserves original art.
  for(let i=0;i<arr.length;i+=4){
   const r=arr[i],gg=arr[i+1],b=arr[i+2],alpha=arr[i+3];
   if(alpha===0)continue;
   const lum=(r+gg+b)/3,diff=Math.max(r,gg,b)-Math.min(r,gg,b);
   if(lum>=19 && lum<115 && diff<31){
     const strength=clamp((115-lum)/18,0,1);arr[i+3]=Math.round(alpha*(1-strength));
   }
  }
  g.putImageData(data,0,0);return off;
 }
 actors.forEach(a=>{
  const image=new Image();image.onload=()=>{a.sheet=makeTransparent(image);a.ready=true};image.onerror=()=>{a.ready=false};image.src=a.src;
 });
 function setTarget(clientX,clientY){
  const r=hero.getBoundingClientRect();pointer.x=clamp((clientX-r.left)/r.width,.05,.95);pointer.y=clamp((clientY-r.top)/r.height,.13,.87);pointer.active=true;
 }
 hero.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')setTarget(e.clientX,e.clientY)},{passive:true});
 hero.addEventListener('pointerleave',()=>{pointer.active=false});
 hero.addEventListener('pointerdown',e=>setTarget(e.clientX,e.clientY),{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(resize).observe(hero);else window.addEventListener('resize',resize);resize();
 function render(now){
  const dt=Math.min((now-(last||now))/1000,.04);last=now;elapsed+=dt;ctx.clearRect(0,0,w,h);
  const scale=clamp(w/1250,.60,1.12);const size=clamp(Math.min(w*.125,h*.36),72,165);
  const minGap=size*.95;
  const targetX=pointer.x*w,targetY=pointer.y*h;
  // Formation places both animals next to one another; never shares a center.
  const centerX=clamp(targetX,size*1.25,w-size*1.25);
  const centerY=clamp(targetY,h*.22,h-size*.65);
  const destinations=[{x:centerX-minGap*.55,y:centerY},{x:centerX+minGap*.55,y:centerY}];
  actors.forEach((a,i)=>{
   const goal=destinations[i],gx=goal.x/w,gy=goal.y/h;
   if(!a.initialized){a.x=(i===0?.65:.80);a.y=.54;a.initialized=true}
   const dx=(gx-a.x)*w,dy=(gy-a.y)*h,dist=Math.hypot(dx,dy);
   const maxSpeed=(pointer.active?230:135)*scale;
   const speed=dist<8?0:Math.min(maxSpeed,dist*3.3);
   const tvx=dist>0?dx/dist*speed:0,tvy=dist>0?dy/dist*speed:0;
   const follow=1-Math.exp(-dt*7);a.vx+=(tvx-a.vx)*follow;a.vy+=(tvy-a.vy)*follow;
   a.x=clamp(a.x+a.vx*dt/w,size*.45/w,1-size*.45/w);
   a.y=clamp(a.y+a.vy*dt/h,size*.45/h,1-size*.42/h);
  });
  // Guaranteed separation after steering; right character remains to the right of the left one.
  let ax=actors[0],bx=actors[1],px=(bx.x-ax.x)*w,py=(bx.y-ax.y)*h;
  if(Math.hypot(px,py)<minGap){const mx=(ax.x+bx.x)/2;ax.x=(mx-minGap/(2*w));bx.x=(mx+minGap/(2*w));ax.y=bx.y=(ax.y+bx.y)/2}
  actors.forEach(a=>{
    if(!a.ready)return;
    const moving=Math.hypot(a.vx,a.vy)>13;
    if(moving){a.phase+=dt*(Math.hypot(a.vx,a.vy)/110)*8}
    const row=!moving?(a.row??0):Math.abs(a.vx)>Math.abs(a.vy)*.7?(a.vx>=0?0:1):(a.vy<0?2:3);
    a.row=row;
    const frame=moving?Math.floor(a.phase)%6:0;
    const cw=a.sheet.width/6,ch=a.sheet.height/4;
    const drawW=size,drawH=size*(ch/cw);
    const x=a.x*w,y=a.y*h;
    ctx.save();
    // A subtle grounded shadow remains under the character.
    ctx.fillStyle='rgba(85,0,12,.14)';ctx.beginPath();ctx.ellipse(x,y+drawH*.34,size*.34,size*.073,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(a.sheet,frame*cw,row*ch,cw,ch,x-drawW/2,y-drawH*.68,drawW,drawH);
    ctx.restore();
  });
  requestAnimationFrame(render);
 }
 requestAnimationFrame(render);
});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
document.addEventListener('shopify:section:load',boot);
})();