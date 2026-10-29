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
   // Layout measured on the user's 1227x777 design canvas.
   // Source image is first mapped to that coordinate system.
   // Row order in the Pawomi sheets: right, left, up, down.
   const DESIGN_W=1227,DESIGN_H=777,COLS=6,ROWS=4;
   const specs=[
    {direction:'right',w:212,h:197},
    {direction:'left',w:212,h:197},
    {direction:'up',w:160,h:210},
    {direction:'down',w:160,h:210}
   ];
   const base=document.createElement('canvas');
   base.width=DESIGN_W;base.height=DESIGN_H;
   const bg=base.getContext('2d',{willReadFrequently:true});
   bg.drawImage(image,0,0,DESIGN_W,DESIGN_H);
   const pitchX=DESIGN_W/COLS,pitchY=DESIGN_H/ROWS;
   const output=[];
   for(let row=0;row<ROWS;row++){
    const frames=[],spec=specs[row];
    for(let col=0;col<COLS;col++){
     const centerX=(col+.5)*pitchX,centerY=(row+.5)*pitchY;
     const sourceX=Math.round(centerX-spec.w/2),sourceY=Math.round(centerY-spec.h/2);
     const frame=document.createElement('canvas');
     frame.width=spec.w;frame.height=spec.h;
     const g=frame.getContext('2d',{willReadFrequently:true});
     // The requested crops can be wider/taller than the cell pitch.
     // Strict clipping prevents an adjacent frame from appearing in this frame.
     const safeX=Math.max(0,Math.ceil(col*pitchX-sourceX));
     const safeY=Math.max(0,Math.ceil(row*pitchY-sourceY));
     const safeRight=Math.min(spec.w,Math.floor((col+1)*pitchX-sourceX));
     const safeBottom=Math.min(spec.h,Math.floor((row+1)*pitchY-sourceY));
     const width=Math.max(0,safeRight-safeX),height=Math.max(0,safeBottom-safeY);
     if(width&&height){
      g.drawImage(base,sourceX+safeX,sourceY+safeY,width,height,safeX,safeY,width,height);
     }
     // Remove the original dark/chessboard background only where connected
     // to the outer edge; dark ink lines enclosed by fur remain untouched.
     let imgData;
     try{imgData=g.getImageData(0,0,spec.w,spec.h)}catch{frames.push(frame);continue}
     const d=imgData.data,W=spec.w,H=spec.h,n=W*H;
     const visited=new Uint8Array(n),queue=new Int32Array(n);
     let head=0,tail=0;
     const background=(i)=>{
      const p=i*4,r=d[p],green=d[p+1],blue=d[p+2],a=d[p+3];
      if(a<8)return true;
      // Neutral dark checkerboard or background, not colorful collar/fur.
      const max=Math.max(r,green,blue),min=Math.min(r,green,blue);
      return max<145&&(max-min)<28;
     };
     function seed(i){if(i>=0&&i<n&&!visited[i]&&background(i)){visited[i]=1;queue[tail++]=i}}
     for(let x=0;x<W;x++){seed(x);seed((H-1)*W+x)}
     for(let y=0;y<H;y++){seed(y*W);seed(y*W+W-1)}
     while(head<tail){
      const i=queue[head++],x=i%W,y=(i/W)|0;
      if(x>0)seed(i-1);if(x<W-1)seed(i+1);
      if(y>0)seed(i-W);if(y<H-1)seed(i+W);
     }
     for(let i=0;i<n;i++)if(visited[i])d[i*4+3]=0;
     g.putImageData(imgData,0,0);
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