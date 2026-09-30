(() => {
  'use strict';
  const card = document.querySelector('.clawd-console');
  if (!card) return;
  const text = card.querySelector('.clawd-typed');
  const sprite = card.querySelector('.clawd-sprite');
  const status = card.querySelector('.clawd-state');
  const replay = card.querySelector('.clawd-replay');
  const messages = [
    'Hi, I’m Wei Zhou.\nI work on vision, robotics,\nand multimodal AI.',
    'Helping machines see,\nunderstand, and act.\nOne idea at a time.',
    'Curious about intelligent machines?\nLet’s explore together.'
  ];
  let paused = document.documentElement.dataset.motion === 'paused';
  let visible = true;
  let frame = null;
  let previous = 0;
  let elapsed = 0;
  let messageIndex = 0;
  let charIndex = 0;
  let stepIndex = 0;
  let state = 'start';
  let threshold = 650;
  const setPose = index => sprite.style.setProperty('--clawd-frame',index);
  function update() {
    card.classList.toggle('is-paused',paused || document.hidden || !visible);
    card.classList.toggle('is-typing',state === 'typing' && !paused && visible && !document.hidden);
    status.textContent = paused ? 'PAUSED' : state === 'typing' ? 'TYPING…' : 'HELLO, WORLD';
  }
  function staticGreeting() {
    text.textContent = messages[0];setPose(0);card.classList.remove('is-typing');
  }
  function advance() {
    const message = messages[messageIndex];
    if (state === 'start' || state === 'between') {
      text.textContent = '';charIndex = 0;stepIndex = 0;state = 'typing';threshold = 75;
    } else if (state === 'typing') {
      charIndex++;text.textContent = message.slice(0,charIndex);
      stepIndex++;setPose(Math.floor(stepIndex/2)%6);
      const char = message[charIndex-1];
      threshold = char === '\n' ? 360 : /[.,?!]/.test(char) ? 280 : 48 + (charIndex%4)*11;
      if(charIndex === message.length){state = 'hold';threshold = 5200;setPose(0);}
    } else {
      messageIndex=(messageIndex+1)%messages.length;state='between';threshold=500;
    }
    update();
  }
  function tick(time) {
    frame=null;
    if(paused || document.hidden || !visible)return;
    elapsed += previous ? Math.min(time-previous,100) : 0;previous=time;
    if(elapsed >= threshold){elapsed=0;advance();}
    frame=requestAnimationFrame(tick);
  }
  function restart() {
    if(frame !== null)cancelAnimationFrame(frame);
    frame=null;previous=0;update();
    if(!paused && visible && !document.hidden)frame=requestAnimationFrame(tick);
  }
  function reset() {
    messageIndex=0;charIndex=0;elapsed=0;state='start';threshold=400;setPose(0);
    if(paused)staticGreeting();else text.textContent='';
    restart();
  }
  replay.hidden=false;replay.addEventListener('click',reset);
  document.addEventListener('site:motion',event=>{
    paused=event.detail.paused;
    restart();
  });
  document.addEventListener('visibilitychange',restart);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();},{threshold:.05}).observe(card);
  if(paused)staticGreeting();else text.textContent='';
  restart();
})();
