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

  document.addEventListener('DOMContentLoaded', function () {
    highlightActiveLink();
    setupMobileToggle();
  });
})();
