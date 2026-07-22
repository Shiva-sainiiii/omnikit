/**
 * nav.js
 * Shared navigation behavior for all tool pages.
 * - Highlights the active nav link based on current path
 * - Handles mobile nav toggle (if a hamburger button is present)
 */

(function () {
  'use strict';

  function highlightActiveLink() {
    var links = document.querySelectorAll('.main-nav a');
    var currentPath = window.location.pathname.replace(/\/index\.html$/, '/');

    links.forEach(function (link) {
      var linkPath = link.getAttribute('href');
      if (!linkPath) return;

      // Normalize relative links for comparison
      var resolved = new URL(linkPath, window.location.href).pathname;

      if (resolved === currentPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function setupMobileToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupDrawers() {
    var overlay = document.getElementById('drawerOverlay');
    var toolsDrawer = document.getElementById('toolsDrawer');
    var siteDrawer = document.getElementById('siteDrawer');
    var toolsDrawerBtn = document.getElementById('toolsDrawerBtn');
    var siteDrawerBtn = document.getElementById('siteDrawerBtn');
    var closeToolsDrawer = document.getElementById('closeToolsDrawer');
    var closeSiteDrawer = document.getElementById('closeSiteDrawer');

    if (!overlay) return; // drawers not present on this page

    function openDrawer(drawer) {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeAllDrawers() {
      if (toolsDrawer) toolsDrawer.classList.remove('is-open');
      if (siteDrawer) siteDrawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    if (toolsDrawerBtn && toolsDrawer) {
      toolsDrawerBtn.addEventListener('click', function () {
        openDrawer(toolsDrawer);
      });
    }

    if (siteDrawerBtn && siteDrawer) {
      siteDrawerBtn.addEventListener('click', function () {
        openDrawer(siteDrawer);
      });
    }

    if (closeToolsDrawer) closeToolsDrawer.addEventListener('click', closeAllDrawers);
    if (closeSiteDrawer) closeSiteDrawer.addEventListener('click', closeAllDrawers);
    overlay.addEventListener('click', closeAllDrawers);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllDrawers();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    highlightActiveLink();
    setupMobileToggle();
    setupDrawers();
  });
})();
