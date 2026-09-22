/* ═══════════════════════════════════════════════════════════════
   PMAS Platform — main.js
   Core app logic: page init, smooth scroll, active nav, year stamp
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ── Page initialization ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initYearStamp();
  initSmoothScroll();
  initActiveNav();
  initHeaderScroll();
  initMobileNav();
  initRevealObserver();
  initCounterAnimation();
  initContactForm();
});

/* ── Year stamp in footer ────────────────────────────────── */
function initYearStamp() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── Smooth scroll for anchor links ──────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target && target.id !== '') {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ── Active navigation link ──────────────────────────────── */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Header shadow on scroll ────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Contact form (front-end only, no backend) ──────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Message sent ✓';
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2500);
    }, 1200);
  });
}
