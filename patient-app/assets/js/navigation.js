/* ═══════════════════════════════════════════════════════════════
   PMAS Platform — navigation.js
   Mobile nav toggle, dropdown handling, keyboard nav
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ── Mobile navigation toggle ─────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
    const expanded = links.classList.contains('open');
    toggle.setAttribute('aria-expanded', expanded);
  });

  // Close mobile nav when a link is clicked
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      toggle.classList.remove('active');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.classList.remove('active');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Scroll spy: highlight nav link for current section ─── */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length === 0 || navLinks.length === 0) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          const id = section.getAttribute('id');
          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
              link.classList.toggle('active',
                link.getAttribute('href') === '#' + id);
            });
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* Expose for main.js */
window.initMobileNav = initMobileNav;
window.initScrollSpy = initScrollSpy;
