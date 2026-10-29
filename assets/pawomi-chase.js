/* PAWOMI HERO GAME v2 — cropped transparent sprite frames + independent roaming */
(()=>{'use strict';
function boot(){
 document.querySelectorAll('.hero.red-section').forEach(hero=>{
  if(hero.dataset.pawomiGame==='v2')return;
  hero.dataset.pawomiGame='v2';
  hero.querySelectorAll('.pawomi-chase-canvas').forEach(el=>el.remove());
  const canvas=document.createElement('canvas');
  canvas.className='pawomi-chase-canvas';canvas.setAttribute('aria-hidden','true');hero.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const base=hero.dataset.gameBase||'./';
  const agents=[
   {name:'dog',src:base+'pawomi-game-dog.png',x:.68,y:.57,vx:0,vy:0,phase:0,row:0,frames:null,goal:null,until:0},
   {name:'cat',src:base+'pawomi-game-cat.png',x:.82,y:.56,vx:0,vy:0,phase:2,row:0,frames:null,goal:null,until:0}
  ];
  const mouse={x:.7,y:.5,active:false,last:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let w=1,h=1,dpr=1,last=0,clock=0,active=true;
  const cols=6,rows=4;
  function resize(){const rect=hero.getBoundingClientRect();w=Math.max(1,rect.width);h=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  function framesFromSheet(image){
   // The uploaded 1536x1024 sheets have 6 columns and 4 direction rows.
   // Each tile is extracted in source pixel coordinates with no scaling bleed.
   const output=[], sw=image.naturalWidth,sh=image.naturalHeight;
   for(let row=0;row<4;row++){
    const cells=[];
    for(let col=0;col<6;col++){
     const sx=Math.round(col*sw/6),sy=Math.round(row*sh/4);
     const ex=Math.round((col+1)*sw/6),ey=Math.round((row+1)*sh/4);
     const cw=ex-sx,ch=ey-sy,frame=document.createElement('canvas');
     frame.width=cw;frame.height=ch;
     const g=frame.getContext('2d',{willReadFrequently:true});
     g.drawImage(image,sx,sy,cw,ch,0,0,cw,ch);
     let im;try{im=g.getImageData(0,0,cw,ch)}catch{cells.push(frame);continue}
     const rgba=im.data,n=cw*ch;
     const core=new Uint8Array(n),mask=new Uint8Array(n);
     // Background is charcoal/brown, fur is ivory, and collar/patches are vivid.
     // Avoid treating the brown background as orange fur (old segmentation bug).
     for(let i=0;i<n;i++){
      const k=i*4,r=rgba[k],gr=rgba[k+1],b=rgba[k+2];
      const ivory=r>174&&gr>158&&b>125;
      const red=r>118&&r>gr*1.65&&r>b*1.65;
      const orange=r>161&&gr>79&&r>gr*1.22&&gr>b*1.28;
      const gold=r>165&&gr>110&&b<105;
      if(rgba[k+3]>50&&(ivory||red||orange||gold))core[i]=1;
     }
     // Reject small stray islands with a connected-component foreground pass.
     const visited=new Uint8Array(n),stack=new Int32Array(n);
     let biggest=[],componentCount=0;
     for(let i=0;i<n;i++)if(core[i]&&!visited[i]){
      let top=0,head=0;stack[top++]=i;visited[i]=1;
      while(head<top){
       const v=stack[head++],x=v%cw,y=(v/cw)|0;
       const next=[x>0?v-1:-1,x<cw-1?v+1:-1,y>0?v-cw:-1,y<ch-1?v+cw:-1];
       for(const u of next)if(u>=0&&core[u]&&!visited[u]){visited[u]=1;stack[top++]=u}
      }
      if(top>componentCount){componentCount=top;biggest=Array.from(stack.subarray(0,top))}
     }
     // Keep larger separated paws/tail islands too, but not background noise.
     // Fur-filled pixels seed a bounded contour expansion preserving ink outlines.
     for(const i of biggest)mask[i]=1;
     // Also keep original colored pixels close to the main character; limbs may disconnect.
     const seed=new Uint8Array(n);for(let i=0;i<n;i++)if(core[i])seed[i]=1;
     const radius=Math.max(10,Math.round(cw*.065));
     const horiz=new Uint8Array(n);
     for(let y=0;y<ch;y++){let count=0;for(let x=0;x<cw;x++){
       if(x+radius<cw)count+=seed[y*cw+x+radius];
       if(x-radius-1>=0)count-=seed[y*cw+x-radius-1];
       if(count>0)horiz[y*cw+x]=1;
     }}
     for(let x=0;x<cw;x++){let count=0;for(let y=0;y<ch;y++){
       if(y+radius<ch)count+=horiz[(y+radius)*cw+x];
       if(y-radius-1>=0)count-=horiz[(y-radius-1)*cw+x];
       if(count>0)mask[y*cw+x]=1;
     }}
     for(let i=0;i<n;i++)if(!mask[i])rgba[i*4+3]=0;
     g.putImageData(im,0,0);
     cells.push(frame);
    }
    output.push(cells);
   }
   return output;
  }
  agents.forEach(a=>{const image=new Image();image.onload=()=>{a.frames=framesFromSheet(image)};image.src=a.src});
  function target(e){
   const r=hero.getBoundingClientRect();mouse.x=clamp((e.clientX-r.left)/r.width,.04,.96);mouse.y=clamp((e.clientY-r.top)/r.height,.12,.90);
   mouse.active=true;mouse.last=performance.now();
  }
  hero.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')target(e)},{passive:true});
  hero.addEventListener('pointerdown',target,{passive:true});
  hero.addEventListener('pointerleave',()=>{mouse.active=false});
  function randomGoal(a,i,size){
   // Roam predominantly on the right half so headings stay easy to read.
   const left=Math.min(w-size,Math.max(size*.62,w*.46));
   const right=Math.max(left+1,w-size*.6);
   const sideBias=i===0?-.055:.055;
   a.goal={x:clamp(left+Math.random()*(right-left)+sideBias*w,size*.6,w-size*.6),y:clamp(h*.2+Math.random()*h*.58,size*.4,h-size*.48)};
   a.until=clock+2+Math.random()*4;
  }
  function animate(ts){
   if(!document.contains(hero))return;
   const dt=Math.min((ts-(last||ts))/1000,.045);last=ts;clock+=dt;
   ctx.clearRect(0,0,w,h);
   const size=clamp(Math.min(w*.11,h*.31),64,145);
   if(mouse.active && ts-mouse.last>2500)mouse.active=false;
   const minGap=size*1.13;
   const targetX=mouse.x*w,targetY=mouse.y*h;
   agents.forEach((a,i)=>{
    if(!a.goal||(!mouse.active&&(clock>a.until||Math.hypot(a.goal.x-a.x*w,a.goal.y-a.y*h)<size*.22)))randomGoal(a,i,size);
    let tx,ty;
    if(mouse.active){const center=clamp(targetX,size*1.3,w-size*1.3);tx=center+(i===0?-minGap*.58:minGap*.58);ty=clamp(targetY,h*.17,h-size*.43)}
    else {tx=a.goal.x;ty=a.goal.y}
    const dx=tx-a.x*w,dy=ty-a.y*h,dist=Math.hypot(dx,dy);
    const maxSpeed=(mouse.active?245:88)*clamp(w/1250,.65,1.15);
    const speed=dist<5?0:Math.min(maxSpeed,dist*(mouse.active?3.3:1.8));
    const follow=1-Math.exp(-dt*5);
    a.vx+=(dist>0?dx/dist*speed-a.vx:-a.vx)*follow;
    a.vy+=(dist>0?dy/dist*speed-a.vy:-a.vy)*follow;
    a.x=clamp(a.x+a.vx*dt/w,size*.5/w,1-size*.5/w);
    a.y=clamp(a.y+a.vy*dt/h,size*.36/h,1-size*.36/h);
   });
   // Maintain separation even when both paths cross. Correct along the actual
   // collision vector, not just by moving both to the same Y coordinate.
   const a=agents[0],b=agents[1];let dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,d=Math.hypot(dx,dy);
   if(d<minGap){if(d<.001){dx=1;dy=0;d=1}
    const amount=(minGap-d)/2,nx=dx/d,ny=dy/d;
    a.x=clamp(a.x-nx*amount/w,size*.5/w,1-size*.5/w);a.y=clamp(a.y-ny*amount/h,size*.36/h,1-size*.36/h);
    b.x=clamp(b.x+nx*amount/w,size*.5/w,1-size*.5/w);b.y=clamp(b.y+ny*amount/h,size*.36/h,1-size*.36/h);
   }
   agents.forEach(a=>{
    if(!a.frames)return;
    const velocity=Math.hypot(a.vx,a.vy),moving=velocity>14;
    if(moving)a.phase=(a.phase+dt*clamp(velocity/35,2,8))%6;
    if(moving)a.row=Math.abs(a.vx)>Math.abs(a.vy)*.8?(a.vx>=0?0:1):(a.vy<0?2:3);
    const frame=moving?Math.floor(a.phase)%6:0;
    const tile=a.frames[a.row]?.[frame];if(!tile)return;
    const aspect=tile.height/tile.width,dh=size*aspect,x=a.x*w,y=a.y*h;
    ctx.fillStyle='rgba(80,0,0,.13)';ctx.beginPath();ctx.ellipse(x,y+dh*.32,size*.30,size*.055,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(tile,x-size/2,y-dh*.7,size,dh);
   });
   if(active)requestAnimationFrame(animate);
  }
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(hero);else addEventListener('resize',resize);
  resize();requestAnimationFrame(animate);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
document.addEventListener('shopify:section:load',boot);
})();