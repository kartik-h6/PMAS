/* ═══════════════════════════════════════════════════════════════
   PMAS Platform — animations.js
   Scroll-triggered reveals, stat counter animation, parallax
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ── Intersection Observer for scroll reveals ────────────── */
function initRevealObserver() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ── Animated stat counters ───────────────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => { el.textContent = el.getAttribute('data-count'); });
    return;
  }

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = (target % 1 !== 0) ? 1 : 0;
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ── Subtle parallax on hero blobs ────────────────────────── */
function initParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (blobs.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        blobs.forEach((blob, i) => {
          const speed = (i + 1) * 0.15;
          blob.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* Expose for main.js */
window.initRevealObserver = initRevealObserver;
window.initCounterAnimation = initCounterAnimation;

document.addEventListener('DOMContentLoaded', initParallax);
