(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const toggle = document.querySelector('.motion-toggle');
  const canvas = document.querySelector('#orbital-canvas');
  let frame = null;
  let phase = 0;
  let lastTime = 0;
  let inView = true;
  let pointer = {x:0,y:0};
  let width = 0, height = 0;
  let context;
  const syncButton = () => {if(toggle){toggle.textContent = paused ? 'Play motion' : 'Pause motion';toggle.setAttribute('aria-pressed',String(paused));}document.dispatchEvent(new CustomEvent('site:motion',{detail:{paused,reduced:reduced.matches}}));};
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--progress', `${max > 0 ? scrollY / max * 100 : 0}%`);
  }
  addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }), {threshold:0.06});
    document.querySelectorAll('.home .section,.about-strip,.join-banner').forEach(el => {el.classList.add('reveal-ready');observer.observe(el);});
  }
  if (!canvas) return;
  context = canvas.getContext('2d');
  if (!context) return;
  if(toggle){toggle.hidden=false;syncButton();toggle.addEventListener('click',()=>{paused=!paused;syncButton();restart();});}
  function project(x,y,z) {
    const angle = phase*.12 + pointer.x*.15;
    const c=Math.cos(angle),s=Math.sin(angle);
    const x1=x*c-z*s,z1=x*s+z*c;
    const tilt=.35+pointer.y*.13;
    const y1=y*Math.cos(tilt)-z1*Math.sin(tilt),z2=y*Math.sin(tilt)+z1*Math.cos(tilt);
    const scale=1/(1-z2*.23);
    const radius=width<700 ? width*.8 : Math.max(width*.36,height*.44);
    return {x:width*.63+x1*radius*scale,y:height*.52+y1*radius*scale,z:z2};
  }
  function draw() {
    context.clearRect(0,0,width,height);
    const glow=context.createRadialGradient(width*.63,height*.52,0,width*.63,height*.52,Math.max(width,height)*.65);
    glow.addColorStop(0,'rgba(99,126,255,.11)');glow.addColorStop(.65,'rgba(122,89,240,.045)');glow.addColorStop(1,'rgba(0,0,0,0)');
    context.fillStyle=glow;context.fillRect(0,0,width,height);
    for(let ring=0;ring<18;ring++){
      const latitude=(ring/17-.5)*Math.PI;
      let previous;
      for(let n=0;n<=100;n++){
        const angle=n/100*Math.PI*2;
        const ripple=1+.035*Math.sin(angle*5+phase+latitude*4);
        const p=project(Math.cos(latitude)*Math.cos(angle)*ripple,Math.sin(latitude),Math.cos(latitude)*Math.sin(angle)*ripple);
        if(previous){context.strokeStyle=`rgba(155,177,255,${.045+(p.z+1)*.11})`;context.lineWidth=.6;context.beginPath();context.moveTo(previous.x,previous.y);context.lineTo(p.x,p.y);context.stroke();}
        previous=p;
      }
    }
    for(let meridian=0;meridian<23;meridian++){
      const angle=meridian/23*Math.PI*2;let previous;
      for(let n=0;n<=45;n++){
        const latitude=(n/45-.5)*Math.PI;
        const ripple=1+.035*Math.sin(angle*5+phase+latitude*4);
        const p=project(Math.cos(latitude)*Math.cos(angle)*ripple,Math.sin(latitude),Math.cos(latitude)*Math.sin(angle)*ripple);
        if(previous){context.strokeStyle=`rgba(125,150,244,${.035+(p.z+1)*.065})`;context.lineWidth=.55;context.beginPath();context.moveTo(previous.x,previous.y);context.lineTo(p.x,p.y);context.stroke();}
        if(n%5===0&&meridian%2===0){context.fillStyle=`rgba(190,211,255,${.2+(p.z+1)*.3})`;context.beginPath();context.arc(p.x,p.y,.8+(p.z+1)*.45,0,Math.PI*2);context.fill();}
        previous=p;
      }
    }
    for(let orbit=0;orbit<3;orbit++){
      let previous;
      for(let n=0;n<=150;n++){
        const t=n/150*Math.PI*2;
        const r=1.3+orbit*.12;
        const p=project(Math.cos(t)*r,Math.sin(t)*(.25+orbit*.2),Math.sin(t)*r*.8);
        if(previous){context.strokeStyle=orbit===0?'rgba(214,249,157,.25)':'rgba(154,169,234,.16)';context.lineWidth=.65;context.beginPath();context.moveTo(previous.x,previous.y);context.lineTo(p.x,p.y);context.stroke();}previous=p;
      }
      const t=phase*(.28+orbit*.07)+orbit*2;
      const r=1.3+orbit*.12;
      const p=project(Math.cos(t)*r,Math.sin(t)*(.25+orbit*.2),Math.sin(t)*r*.8);
      context.fillStyle=orbit===0?'#d9f99d':'#bacbff';context.shadowBlur=16;context.shadowColor=context.fillStyle;context.beginPath();context.arc(p.x,p.y,3,0,Math.PI*2);context.fill();context.shadowBlur=0;
    }
  }
  function tick(time){frame=null;if(paused||document.hidden||!inView)return;if(!lastTime||time-lastTime>=32){phase+=lastTime?Math.min((time-lastTime)/1000,.08):.03;lastTime=time;draw();}frame=requestAnimationFrame(tick);}
  function restart(){if(frame)cancelAnimationFrame(frame);frame=null;lastTime=0;draw();if(!paused&&!document.hidden&&inView)frame=requestAnimationFrame(tick);}
  function resize(){const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;context.setTransform(ratio,0,0,ratio,0,0);draw();}
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('pointermove',event=>{if(paused)return;const r=canvas.getBoundingClientRect();pointer={x:(event.clientX-r.left)/r.width-.5,y:(event.clientY-r.top)/r.height-.5};},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{pointer={x:0,y:0};});
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;restart();}).observe(canvas);
  document.addEventListener('visibilitychange',restart);
  reduced.addEventListener('change',event=>{paused=event.matches;syncButton();document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('is-visible'));restart();});
  resize();restart();
})();
