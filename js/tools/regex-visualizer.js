/**
 * regex-visualizer.js
 * Live regex testing against user text with highlighted match output.
 * Fully client-side — uses native RegExp, no network calls.
 */

(function () {
  'use strict';

  var patternInput = document.getElementById('regexPattern');
  var flagsInput = document.getElementById('regexFlags');
  var testText = document.getElementById('testText');
  var highlightOutput = document.getElementById('highlightOutput');
  var matchList = document.getElementById('matchList');
  var statusMsg = document.getElementById('statusMsg');
  var presetButtons = document.querySelectorAll('.preset-btn');

  if (!patternInput) return;

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'status-msg show ' + type;
  }

  function hideStatus() {
    statusMsg.className = 'status-msg';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function runMatch() {
    var patternStr = patternInput.value;
    var flags = flagsInput.value || '';
    var text = testText.value;

    if (!patternStr) {
      highlightOutput.textContent = 'Enter a pattern above to see matches highlighted here.';
      matchList.innerHTML = '';
      hideStatus();
      return;
    }

    var regex;
    try {
      // Ensure 'g' flag so we can find all matches for highlighting
      var effectiveFlags = flags.includes('g') ? flags : flags + 'g';
      regex = new RegExp(patternStr, effectiveFlags);
    } catch (err) {
      showStatus('Invalid regex: ' + err.message, 'error');
      highlightOutput.textContent = text;
      matchList.innerHTML = '';
      return;
    }

    if (!text) {
      highlightOutput.textContent = 'Paste some test text to see matches.';
      matchList.innerHTML = '';
      hideStatus();
      return;
    }

    var matches = [];
    var lastIndex = 0;
    var htmlParts = [];
    var m;
    var safetyCounter = 0;

    // Reset regex state for exec loop
    regex.lastIndex = 0;

    while ((m = regex.exec(text)) !== null) {
      matches.push(m);
      htmlParts.push(escapeHtml(text.slice(lastIndex, m.index)));
      htmlParts.push('<mark>' + escapeHtml(m[0]) + '</mark>');
      lastIndex = m.index + m[0].length;

      // Prevent infinite loop on zero-length matches
      if (m[0].length === 0) {
        regex.lastIndex++;
      }

      safetyCounter++;
      if (safetyCounter > 5000) break; // sanity guard
    }

    htmlParts.push(escapeHtml(text.slice(lastIndex)));
    highlightOutput.innerHTML = htmlParts.join('');

    if (matches.length === 0) {
      showStatus('Valid pattern — 0 matches found.', 'error');
    } else {
      showStatus('Valid pattern — ' + matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ' found.', 'success');
    }

    matchList.innerHTML = matches.map(function (match, i) {
      return '<li>#' + (i + 1) + ': "' + escapeHtml(match[0]) + '" at index ' + match.index + '</li>';
    }).join('');
  }

  patternInput.addEventListener('input', runMatch);
  flagsInput.addEventListener('input', runMatch);
  testText.addEventListener('input', runMatch);

  presetButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      patternInput.value = btn.getAttribute('data-pattern');
      flagsInput.value = btn.getAttribute('data-flags') || 'g';
      runMatch();
    });
  });

  // Run once on load in case test text is pre-filled
  document.addEventListener('DOMContentLoaded', function () {
    if (patternInput.value || testText.value) {
      runMatch();
    }
  });
})();
