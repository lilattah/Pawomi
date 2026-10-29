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
   // The uploaded source files already have real alpha transparency.
   // Never recolor or filter black pixels: they are the character's outlines.
   const sw=image.naturalWidth,sh=image.naturalHeight,output=[];
   for(let row=0;row<4;row++){
    const frames=[];
    for(let col=0;col<6;col++){
     const x0=Math.round(col*sw/6),x1=Math.round((col+1)*sw/6);
     const y0=Math.round(row*sh/4),y1=Math.round((row+1)*sh/4);
     const W=x1-x0,H=y1-y0,frame=document.createElement('canvas');
     frame.width=W;frame.height=H;
     const g=frame.getContext('2d',{willReadFrequently:true});
     g.drawImage(image,x0,y0,W,H,0,0,W,H);
     const sample=g.getImageData(0,0,W,H),data=sample.data,count=W*H;
     const seen=new Uint8Array(count),labels=new Int32Array(count);
     const queue=new Int32Array(count);
     let selected=0,largest=0,component=0;
     // Connected alpha components, not color classification. This keeps
     // every black stroke INSIDE the dog/cat including eye and nose ink.
     for(let i=0;i<count;i++){
      if(seen[i]||data[i*4+3]<95)continue;
      component++;let head=0,tail=1;queue[0]=i;seen[i]=1;labels[i]=component;
      while(head<tail){
       const v=queue[head++],xx=v%W,yy=(v/W)|0;
       const n0=xx>0?v-1:-1,n1=xx<W-1?v+1:-1,n2=yy>0?v-W:-1,n3=yy<H-1?v+W:-1;
       for(const n of [n0,n1,n2,n3]){
        if(n>=0&&!seen[n]&&data[n*4+3]>=95){seen[n]=1;labels[n]=component;queue[tail++]=n}
       }
      }
      if(tail>largest){largest=tail;selected=component}
     }
     // Keep the largest connected character plus its antialiased fringe.
     // The tiny disconnected fragments from neighboring frames are rejected.
     const keep=new Uint8Array(count);
     for(let i=0;i<count;i++)if(labels[i]===selected)keep[i]=1;
     const antialias=new Uint8Array(keep);
     for(let i=0;i<count;i++)if(keep[i]){
      const x=i%W,y=(i/W)|0;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
       const nx=x+dx,ny=y+dy;
       if(nx>=0&&nx<W&&ny>=0&&ny<H)antialias[ny*W+nx]=1;
      }
     }
     for(let i=0;i<count;i++)if(!antialias[i])data[i*4+3]=0;
     g.putImageData(sample,0,0);
     frames.push(frame);
    }
    output.push(frames);
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
    ctx.fillStyle='#CD071B';ctx.fillRect(x-size/2-3,y-dh*.7-3,size+6,dh+6);
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