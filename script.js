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

  // 3D hero typography: restrained pointer tilt on desktop only.
  const heroHeading = $('.hero-heading');
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (heroHeading && finePointer && !reduceMotion) {
    const hero = $('.hero');
    hero?.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      heroHeading.style.transform = `rotateY(${x * -3.2}deg) rotateX(${y * 2.2}deg) translateZ(12px)`;
    }, { passive: true });
    hero?.addEventListener('pointerleave', () => { heroHeading.style.transform = 'rotateY(0) rotateX(0) translateZ(0)'; });
  }

  // Perspective project cards: subtle tilt, never a full-screen gimmick.
  if (finePointer && !reduceMotion) {
    $$('.project-card').forEach(card => {
      const visual = $('.project-visual', card);
      if (!visual) return;
      card.addEventListener('pointermove', event => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        visual.style.transform = `perspective(1000px) rotateY(${x * 3.5}deg) rotateX(${y * -3.5}deg) translateZ(5px)`;
      }, { passive: true });
      card.addEventListener('pointerleave', () => { visual.style.transform = ''; });
    });
  }

  // Mark large headings as observed once they enter the viewport.
  const depthHeadings = $$('.display-title, .contact-title, .intermission-title');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const depthObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('depth-ready'); depthObserver.unobserve(entry.target); }
      });
    }, { threshold: .2 });
    depthHeadings.forEach(item => depthObserver.observe(item));
  } else { depthHeadings.forEach(item => item.classList.add('depth-ready')); }


  // Cinematic scene activation and sticky navigation state.
  const navBar = $('.site-nav');
  const sceneSections = $$('.hero, .story, .work, .intermission, .mind, .contact');
  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scene-active');
          $$('.project-card', entry.target).forEach((card, index) => {
            card.style.transitionDelay = (index * 110) + 'ms';
            card.classList.add('scene-visible');
          });
        }
      });
    }, { threshold: .18 });
    sceneSections.forEach(section => sceneObserver.observe(section));
  } else {
    sceneSections.forEach(section => {
      section.classList.add('scene-active');
      $$('.project-card', section).forEach(card => card.classList.add('scene-visible'));
    });
  }
  window.addEventListener('scroll', () => {
    navBar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Soft ambient pointer light; disabled for touch and reduced-motion users.
  if (finePointer && !reduceMotion) {
    document.body.classList.add('has-mouse-glow');
    let glowQueued = false;
    window.addEventListener('pointermove', event => {
      if (glowQueued) return;
      glowQueued = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', event.clientX + 'px');
        document.documentElement.style.setProperty('--my', event.clientY + 'px');
        glowQueued = false;
      });
    }, { passive: true });
  }

})();