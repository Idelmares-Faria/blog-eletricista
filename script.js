/* ============================================================
   Blog do Eletricista — Theme Toggle & Interactions
   ============================================================ */

(function () {
  'use strict';

  // ---------- Theme Toggle ----------
  const html = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'blogeletricista-theme';

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

  // ---------- Helpers ----------
  var ARROW = '<svg class="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

  function formatDate(str) {
    var d = new Date(str);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function tagClass(color) {
    var map = { yellow: 'tag--orange', red: 'tag--red', blue: 'tag--blue', green: 'tag--green', orange: 'tag--orange', cyan: 'tag--cyan', purple: 'tag--purple' };
    return map[color] || 'tag--blue';
  }

  function renderTags(tags, color) {
    return (tags || []).map(function(t) {
      return '<span class="tag ' + tagClass(color) + '">' + t + '</span>';
    }).join('');
  }

  function featuredCard(post) {
    return '<article class="post-card post-card--featured reveal">' +
      '<a href="/post/' + post.slug + '" class="post-card__image-wrap">' +
      '<img src="' + (post.image || '') + '" alt="' + post.title + '" class="post-card__image" loading="lazy"/></a>' +
      '<div class="post-card__body">' +
      '<span class="post-card__meta">' + post.author.name + ' &bull; ' + formatDate(post.date) + '</span>' +
      '<a href="/post/' + post.slug + '" class="post-card__title-link"><h3 class="post-card__title">' + post.title + '</h3></a>' +
      '<p class="post-card__excerpt">' + post.excerpt + '</p>' +
      '<div class="post-card__tags">' + renderTags(post.tags, post.category.color) + '</div>' +
      '</div></article>';
  }

  function horizontalCard(post) {
    return '<article class="post-card post-card--horizontal reveal">' +
      '<a href="/post/' + post.slug + '" class="post-card__image-wrap">' +
      '<img src="' + (post.image || '') + '" alt="' + post.title + '" class="post-card__image" loading="lazy"/></a>' +
      '<div class="post-card__body">' +
      '<span class="post-card__meta">' + post.author.name + ' &bull; ' + formatDate(post.date) + '</span>' +
      '<a href="/post/' + post.slug + '" class="post-card__title-link"><h3 class="post-card__title post-card__title--sm">' + post.title + '</h3></a>' +
      '<p class="post-card__excerpt">' + post.excerpt + '</p>' +
      '<div class="post-card__tags">' + renderTags(post.tags, post.category.color) + '</div>' +
      '</div></article>';
  }

  function verticalCard(post) {
    return '<article class="post-card post-card--vertical reveal">' +
      '<a href="/post/' + post.slug + '" class="post-card__image-wrap">' +
      '<img src="' + (post.image || '') + '" alt="' + post.title + '" class="post-card__image" loading="lazy"/></a>' +
      '<div class="post-card__body">' +
      '<span class="post-card__meta">' + post.author.name + ' &bull; ' + formatDate(post.date) + '</span>' +
      '<a href="/post/' + post.slug + '" class="post-card__title-link"><h3 class="post-card__title">' + post.title + '</h3></a>' +
      '<p class="post-card__excerpt">' + post.excerpt + '</p>' +
      '<div class="post-card__tags">' + renderTags(post.tags, post.category.color) + '</div>' +
      '</div></article>';
  }

  // ---------- Load Posts ----------
  var currentPage = 1;

  function loadPosts(page) {
    currentPage = page;
    fetch('/api/posts?page=' + page + '&limit=6')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (!res.success) return;
        var posts = res.data;
        var pagination = res.pagination;

        // Recent posts grid: featured + 2 horizontal
        var recentGrid = document.getElementById('recentPostsGrid');
        if (recentGrid && page === 1) {
          var html2 = '';
          if (posts.length > 0) html2 += featuredCard(posts[0]);
          if (posts.length > 1) {
            html2 += '<div class="recent-posts__side">';
            if (posts[1]) html2 += horizontalCard(posts[1]);
            if (posts[2]) html2 += horizontalCard(posts[2]);
            html2 += '</div>';
          }
          recentGrid.innerHTML = html2;
        }

        // All posts grid: remaining posts
        var allGrid = document.getElementById('allPostsGrid');
        if (allGrid) {
          var start = page === 1 ? 3 : 0;
          var html3 = '';
          for (var i = start; i < posts.length; i++) {
            html3 += verticalCard(posts[i]);
          }
          allGrid.innerHTML = html3;
        }

        // Pagination
        var pag = document.getElementById('pagination');
        var nums = document.getElementById('paginationNums');
        var btnPrev = document.getElementById('btnPrev');
        var btnNext = document.getElementById('btnNext');
        if (pag && pagination.totalPages > 1) {
          pag.style.display = '';
          btnPrev.disabled = !pagination.hasPrevPage;
          btnNext.disabled = !pagination.hasNextPage;
          var numsHtml = '';
          for (var p = 1; p <= pagination.totalPages; p++) {
            numsHtml += '<span class="pagination__num' + (p === page ? ' pagination__num--active' : '') + '" data-page="' + p + '">' + p + '</span>';
          }
          nums.innerHTML = numsHtml;
          nums.querySelectorAll('.pagination__num').forEach(function(el) {
            el.addEventListener('click', function() { loadPosts(parseInt(el.dataset.page)); window.scrollTo(0, 0); });
          });
        }

        initScrollReveal();
      })
      .catch(function(e) { console.error('Erro ao carregar posts:', e); });
  }

  // ---------- Back to Top ----------
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Skeleton Loading ----------
  function showSkeletons(container, count) {
    if (!container) return;
    var html = '';
    for (var i = 0; i < count; i++) {
      html += '<div class="skeleton--card skeleton">' +
        '<div class="skeleton--image skeleton"></div>' +
        '<div class="skeleton--card-body">' +
        '<div class="skeleton--text-sm skeleton"></div>' +
        '<div class="skeleton--title skeleton"></div>' +
        '<div class="skeleton--text skeleton"></div>' +
        '<div class="skeleton--tag skeleton"></div>' +
        '</div></div>';
    }
    container.innerHTML = html;
  }

  // ---------- Load Home Categories ----------
  function loadHomeCategories() {
    var homeCatGrid = document.getElementById('homeCategoriesGrid');
    if (!homeCatGrid) return;
    
    fetch('/api/categories')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (!res.success) return;
        var cats = res.data;
        var html = '';
        cats.forEach(function(c) {
          var bgImg = c.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80';
          html += '<a href="/categorias?cat=' + c.slug + '" class="category-preview-card reveal">' +
                  '<div class="category-preview-card__bg" style="background-image: url(' + bgImg + ')"></div>' +
                  '<div class="category-preview-card__overlay"></div>' +
                  '<h3 class="category-preview-card__name">' + c.name + '</h3>' +
                  '</a>';
        });
        homeCatGrid.innerHTML = html;
        initScrollReveal();
      })
      .catch(function(e) {
        console.error('Erro ao carregar categorias na home:', e);
        homeCatGrid.innerHTML = '<p>Erro ao carregar categorias.</p>';
      });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initBackToTop();
    loadHomeCategories();

    var recentGrid = document.getElementById('recentPostsGrid');
    if (recentGrid) {
      showSkeletons(recentGrid, 3);
      loadPosts(1);
      document.getElementById('btnPrev') && document.getElementById('btnPrev').addEventListener('click', function() { loadPosts(currentPage - 1); window.scrollTo(0,0); });
      document.getElementById('btnNext') && document.getElementById('btnNext').addEventListener('click', function() { loadPosts(currentPage + 1); window.scrollTo(0,0); });
    }
  });
})();
