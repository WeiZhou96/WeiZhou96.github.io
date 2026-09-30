(() => {
  'use strict';
  const root = document.documentElement;

  // Pause decorative marquee together with the globe and Clawd.
  document.addEventListener('site:motion', event => {
    root.classList.toggle('motion-paused', !!(event.detail && event.detail.paused));
  });
  // expressive.js initializes the shared preference before this script runs.

  // Cursor-following highlight on cards.
  if (matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', event => {
      const card = event.target.closest && event.target.closest('.research-item, .publication');
      if (!card) return;
      const box = card.getBoundingClientRect();
      const k = box.width / card.offsetWidth || 1; // layout may be zoomed on wide screens
      card.style.setProperty('--mx', `${(event.clientX - box.left) / k}px`);
      card.style.setProperty('--my', `${(event.clientY - box.top) / k}px`);
    }, {passive: true});
  }

  // Count-up for the headline numbers; final text is already in the markup.
  const numbers = document.querySelectorAll('.stat-num[data-count]');
  if (numbers.length && 'IntersectionObserver' in window && root.dataset.motion !== 'paused') {
    const run = el => {
      const target = Number(el.dataset.count), suffix = el.dataset.suffix || '';
      const start = performance.now(), length = 1100;
      el.textContent = '0' + suffix;
      const step = now => {
        const t = root.dataset.motion === 'paused' ? 1 : Math.min((now - start) / length, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { run(entry.target); observer.unobserve(entry.target); }
    }), {threshold: .6});
    numbers.forEach(el => observer.observe(el));
  }
})();
