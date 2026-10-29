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
   const cw=image.naturalWidth/cols,ch=image.naturalHeight/rows;
   const out=[];
   for(let row=0;row<rows;row++){
    const frames=[];
    for(let col=0;col<cols;col++){
     const tile=document.createElement('canvas');tile.width=Math.round(cw);tile.height=Math.round(ch);
     const g=tile.getContext('2d',{willReadFrequently:true});
     g.drawImage(image,col*cw,row*ch,cw,ch,0,0,tile.width,tile.height);
     let data;try{data=g.getImageData(0,0,tile.width,tile.height)}catch{frames.push(tile);continue}
     const {width:tw,height:th}=tile,src=data.data;
     // Segment light fur, red collar, warm orange patches and golden bells.
     // Pixels must belong to the current tile; never sample adjacent frames.
     const core=new Uint8Array(tw*th),keep=new Uint8Array(tw*th);
     for(let y=0;y<th;y++)for(let x=0;x<tw;x++){
      const i=y*tw+x,j=i*4,r=src[j],gr=src[j+1],b=src[j+2],al=src[j+3];
      const light=Math.min(r,gr,b)>143 && r+gr+b>525;
      const warm=r>128&&r>gr*1.24&&gr>b*.85;
      const yellow=r>157&&gr>90&&b<gr*.85;
      const skin=r>125&&gr>72&&b>46&&r>gr*1.12;
      if(al>50&&(light||warm||yellow||skin))core[i]=1;
     }
     // Dilate near light / saturated character fill to retain black contour.
     const radius=Math.max(5,Math.round(tw*.033));
     for(let y=0;y<th;y++)for(let x=0;x<tw;x++)if(core[y*tw+x]){
      for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
       if(dx*dx+dy*dy>radius*radius)continue;
       const xx=x+dx,yy=y+dy;if(xx>=0&&xx<tw&&yy>=0&&yy<th)keep[yy*tw+xx]=1;
      }
     }
     for(let i=0;i<keep.length;i++)if(!keep[i])src[i*4+3]=0;
     g.putImageData(data,0,0);
     // Crop transparent margins *within each cell*, then render into a consistent
     // padded frame so the different stride poses never change apparent scale.
     frames.push(tile);
    }
    out.push(frames);
   }
   return out;
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