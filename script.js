/* ============================================================
   AtivMax Blog — Theme Toggle & Interactions
   ============================================================ */

(function () {
  'use strict';

  // ---------- Theme Toggle ----------
  const html = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'ativmax-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Initialize
  setTheme(getPreferredTheme());

  toggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ---------- Mobile Menu ----------
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('is-open');
    navMenu.classList.toggle('is-open');
  });

  // Close menu on link click
  navMenu.querySelectorAll('.navbar__link').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('is-open');
      navMenu.classList.remove('is-open');
    });
  });

  // ---------- Scroll Reveal ----------
  function initScrollReveal() {
    var cards = document.querySelectorAll(
      '.post-card--featured, .post-card--horizontal, .post-card--vertical, .featured-post__grid, .section__heading'
    );

    cards.forEach(function (el) {
      el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- Pagination Interaction ----------
  function initPagination() {
    var nums = document.querySelectorAll('.pagination__num');
    nums.forEach(function (num) {
      num.addEventListener('click', function () {
        nums.forEach(function (n) { n.classList.remove('pagination__num--active'); });
        num.classList.add('pagination__num--active');
      });
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initPagination();
  });
})();
