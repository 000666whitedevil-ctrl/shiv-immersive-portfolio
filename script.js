(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The intro loader is deliberately short: atmosphere, not a waiting room.
  const loader = $('.preloader');
  const number = $('.pre-number');
  const bar = $('.pre-line i');
  let progress = 0;
  const start = performance.now();
  const finishLoader = () => {
    if (loader && !loader.classList.contains('hide')) {
      loader.classList.add('hide');
      document.body.classList.add('ready');
    }
  };
  const tick = () => {
    progress = Math.min(100, Math.round((performance.now() - start) / 10));
    if (number) number.textContent = String(progress).padStart(2, '0');
    if (bar) bar.style.width = progress + '%';
    if (progress < 100) requestAnimationFrame(tick);
    else setTimeout(finishLoader, 180);
  };
  if (reduceMotion) finishLoader();
  else requestAnimationFrame(tick);
  window.addEventListener('load', () => setTimeout(finishLoader, 350), { once: true });
  setTimeout(finishLoader, 2200);

  // Scroll progress.
  const progressLine = $('.scroll-progress');
  let scrollQueued = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressLine) progressLine.style.width = value + '%';
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  // Reveal sections once; fallback keeps content visible on older browsers.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in-view'));
  }

  // Mobile navigation.
  const trigger = $('.nav-trigger');
  const menu = $('.nav-menu');
  const closeMenu = () => {
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  if (trigger && menu) {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // Custom cursor on pointer devices only.
  const pointer = $('.pointer');
  if (pointer && window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', event => {
      pointer.style.left = event.clientX + 'px';
      pointer.style.top = event.clientY + 'px';
    }, { passive: true });
    $$('a, button, .project-visual, .portrait-frame').forEach(item => {
      item.addEventListener('pointerenter', () => pointer.classList.add('active'));
      item.addEventListener('pointerleave', () => pointer.classList.remove('active'));
    });
  }

  // Restrained parallax: never hijack the page's native scroll.
  const parallaxItems = $$('[data-parallax]');
  if (parallaxItems.length && !reduceMotion && window.matchMedia('(min-width: 801px)').matches) {
    let parallaxQueued = false;
    const moveParallax = () => {
      const vh = window.innerHeight;
      parallaxItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -0.035;
        item.style.translate = `0 ${offset}px`;
      });
      parallaxQueued = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxQueued) {
        parallaxQueued = true;
        requestAnimationFrame(moveParallax);
      }
    }, { passive: true });
    moveParallax();
  }

  // Give external images a graceful fallback instead of a broken-image icon.
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
      const parent = img.parentElement;
      if (parent) parent.classList.add('image-unavailable');
    }, { once: true });
  });

  // Avoid leaving the loader visible when a browser restores the page from cache.
  window.addEventListener('pageshow', event => {
    if (event.persisted) finishLoader();
  });
})();