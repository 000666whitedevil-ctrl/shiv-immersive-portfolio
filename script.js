(() => {
  const loader = document.querySelector('.loader');
  const count = document.querySelector('.loader-count');
  const bar = document.querySelector('.loader-bar i');
  let n = 0;
  const timer = setInterval(() => {
    n += Math.floor(Math.random() * 13) + 5;
    if (n >= 100) {
      n = 100; clearInterval(timer);
      setTimeout(() => loader.classList.add('done'), 250);
    }
    count.textContent = String(n).padStart(2, '0') + '%';
    bar.style.width = n + '%';
  }, 70);

  const cursor = document.querySelector('.cursor');
  if (window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,.project-art').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
  }));

  // Gentle parallax on the orbit and project art; disabled for reduced-motion users.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const orbit = document.querySelector('.hero-orbit');
      if (orbit && y < window.innerHeight * 1.2) {
        orbit.style.transform = `translateY(${y * 0.12}px) rotate(${y * 0.025}deg)`;
      }
    }, { passive: true });
  }
})();