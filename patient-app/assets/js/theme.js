/* ═══════════════════════════════════════════════════════════════
   PMAS Platform — theme.js
   Dark/light theme toggle with localStorage persistence
   PMAS defaults to dark mode (its native design language)
   ═══════════════════════════════════════════════════════════════ */
"use strict";

const Theme = {
  KEY: 'pmas-theme',
  current: 'dark',

  init() {
    // PMAS is designed dark-first; light mode is an accessibility option
    const saved = localStorage.getItem(this.KEY);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    this.current = saved || (prefersLight ? 'light' : 'dark');
    this.apply();
    this.bindToggle();
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.textContent = this.current === 'dark' ? '☀' : '☾';
      toggle.setAttribute('aria-label',
        this.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  },

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.KEY, this.current);
    this.apply();
  },

  bindToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
