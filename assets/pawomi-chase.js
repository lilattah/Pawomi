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
   // Preserve source alpha and black outlines. Extract overlapping source
   // regions; 6x4 grid boundaries are NOT valid character silhouette bounds.
   const sw=image.naturalWidth,sh=image.naturalHeight,cw=sw/6,ch=sh/4;
   const output=[];
   for(let row=0;row<4;row++){
    const frames=[];
    for(let col=0;col<6;col++){
     const centerX=(col+.5)*cw,centerY=(row+.5)*ch;
     const W=Math.round(cw*1.48),H=Math.round(ch*1.28);
     const sx=Math.round(centerX-W/2),sy=Math.round(centerY-H/2);
     const tile=document.createElement('canvas');tile.width=W;tile.height=H;
     const g=tile.getContext('2d',{willReadFrequently:true});
     g.drawImage(image,sx,sy,W,H,0,0,W,H);
     const pixels=g.getImageData(0,0,W,H),d=pixels.data,n=W*H;
     const visited=new Uint8Array(n),labels=new Int32Array(n),queue=new Int32Array(n);
     let bestLabel=0,bestScore=-Infinity,label=0;
     // Keep the single connected silhouette centered on this grid position.
     // Larger crop protects nose, ear and curled tail from truncation.
     for(let i=0;i<n;i++){
      if(visited[i]||d[i*4+3]<80)continue;
      label++;let head=0,tail=1,sumX=0,sumY=0;
      queue[0]=i;visited[i]=1;labels[i]=label;
      while(head<tail){
       const p=queue[head++],x=p%W,y=(p/W)|0;
       sumX+=x;sumY+=y;
       const adjacent=[x>0?p-1:-1,x<W-1?p+1:-1,y>0?p-W:-1,y<H-1?p+W:-1];
       for(const q of adjacent)if(q>=0&&!visited[q]&&d[q*4+3]>=80){
        visited[q]=1;labels[q]=label;queue[tail++]=q;
       }
      }
      const midX=sumX/tail,midY=sumY/tail;
      const distance=Math.hypot((midX-W/2)/(cw*.5),(midY-H/2)/(ch*.5));
      // Exclude disconnected fragments from nearby animation frames.
      const score=tail/(1+Math.pow(distance,3)*6);
      if(score>bestScore){bestScore=score;bestLabel=label}
     }
     const keep=new Uint8Array(n);
     for(let i=0;i<n;i++)if(labels[i]===bestLabel)keep[i]=1;
     // Antialias support; do not replace black ink with background coloring.
     const margin=new Uint8Array(keep);
     for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x;
      if(keep[i])for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
       const j=(y+dy)*W+x+dx;if(j>=0&&j<n)margin[j]=1;
      }
     }
     for(let i=0;i<n;i++)if(!margin[i])d[i*4+3]=0;
     g.putImageData(pixels,0,0);
     frames.push(tile);
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
    const originalCellWidth=tile.width/1.48;const drawW=size*(tile.width/originalCellWidth);const dh=drawW*(tile.height/tile.width),x=a.x*w,y=a.y*h;
    ctx.fillStyle='rgba(80,0,0,.13)';ctx.beginPath();ctx.ellipse(x,y+dh*.22,size*.30,size*.055,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(tile,x-drawW/2,y-dh*.7,drawW,dh);
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