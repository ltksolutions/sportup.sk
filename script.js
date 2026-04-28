// SportUp.sk — nav interactivity (responsive hamburger, current page highlight)
(() => {
  'use strict';

  const MOBILE_BREAKPOINT = 1240; // must match the CSS @media (max-width: 1240px)

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const body = document.body;

    // Insert hamburger bars (3 spans the CSS animates into an X) ONCE.
    // The HTML keeps a fallback <svg>; we replace it for the animated version.
    if (toggle && !toggle.querySelector('.bar')) {
      toggle.innerHTML =
        '<span class="bar" aria-hidden="true"></span>' +
        '<span class="bar" aria-hidden="true"></span>' +
        '<span class="bar" aria-hidden="true"></span>';
      toggle.setAttribute('aria-label', 'Otvoriť menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'nav-links');
      toggle.setAttribute('type', 'button');
    }
    if (links && !links.id) {
      links.id = 'nav-links';
    }

    // Insert backdrop overlay element (created once)
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    const isOpen = () => links && links.classList.contains('open');

    const openMenu = () => {
      if (!links || !toggle) return;
      links.classList.add('open');
      toggle.classList.add('is-open');
      backdrop.classList.add('is-open');
      body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Zavrieť menu');
    };

    const closeMenu = () => {
      if (!links || !toggle) return;
      links.classList.remove('open');
      toggle.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otvoriť menu');
    };

    const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

    // Hamburger click
    if (toggle && links) {
      toggle.addEventListener('click', toggleMenu);
    }

    // Backdrop click closes menu
    backdrop.addEventListener('click', closeMenu);

    // ESC key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeMenu();
    });

    // Click on a link inside the menu closes it (single-page nav UX)
    if (links) {
      links.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.tagName === 'A' && isOpen()) {
          closeMenu();
        }
      });
    }

    // If the viewport is resized above the breakpoint while open, auto-close
    // (prevents stuck panel state when user rotates / resizes desktop window).
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onMqChange = (e) => { if (!e.matches) closeMenu(); };
    if (mq.addEventListener) {
      mq.addEventListener('change', onMqChange);
    } else if (mq.addListener) {
      mq.addListener(onMqChange); // older Safari
    }

    // Highlight current page in nav
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  });
})();
