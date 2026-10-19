/**
 * Aathmaya Vazhappilli Rajesh — portfolio interactions
 * Mobile menu, auto-hiding header, active section in nav, motion helpers,
 * copy-to-clipboard.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });
  }

  // Highlight the nav link for the section in view
  const links = document.querySelectorAll('.site-nav__link');
  const targets = [...links]
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  // The hero has no nav link, so observing it clears the highlight at the top
  const hero = document.getElementById('top');
  if (hero) targets.push(hero);

  if ('IntersectionObserver' in window && targets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === id));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    targets.forEach((t) => observer.observe(t));
  }

  // Header: solid glass once scrolled, hides while scrolling down, returns on scroll up
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  let ticking = false;
  const updateHeader = () => {
    const y = window.scrollY;
    const menuOpen = nav && nav.classList.contains('is-open');
    header.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 160 && !menuOpen);
      lastY = y;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  // Indexes used by CSS to stagger cells, steps and menu items
  document.querySelectorAll('.exam-cells .exam-cell').forEach((cell, i) => cell.style.setProperty('--i', i));
  document.querySelectorAll('.timeline .step').forEach((step, i) => step.style.setProperty('--i', i));
  if (nav) [...nav.children].forEach((item, i) => item.style.setProperty('--i', i));
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, k) => child.style.setProperty('--k', k));
  });

  const root = document.documentElement;
  const motion = root.classList.contains('sda') || root.classList.contains('anim');

  // Fallback reveals for browsers without scroll-driven animations
  if (root.classList.contains('anim')) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
      el.style.setProperty('--d', `${siblings.indexOf(el) * 0.08}s`);
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  }

  // Count the exam score up from 0
  const num = document.querySelector('[data-count]');
  if (num && motion) {
    const target = Number(num.dataset.count);
    const start = performance.now() + 500;
    const tick = (now) => {
      const t = Math.min(Math.max((now - start) / 1100, 0), 1);
      num.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    num.textContent = '0';
    requestAnimationFrame(tick);
  }

  // Copy email / phone
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = 'Copied';
      } catch {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(btn.previousElementSibling);
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'Selected';
      }
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
  });
});
