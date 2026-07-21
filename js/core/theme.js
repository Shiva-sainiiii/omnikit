/**
 * theme.js
 * Handles light/dark theme toggling.
 * Default theme is dark. Preference is remembered via localStorage
 * and applied before paint (see inline snippet note in index.html)
 * to avoid a flash of the wrong theme.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'megatool-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* localStorage unavailable — theme just won't persist */
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'light' ? '☾' : '☀';
      toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  function initToggleButton() {
    var toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var stored = getStoredTheme() || 'dark';
    applyTheme(stored);
    initToggleButton();
  });
})();
