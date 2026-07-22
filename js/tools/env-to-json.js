/**
 * env-to-json.js
 * Parses .env file syntax and converts to JSON or YAML.
 * Fully client-side — no network calls.
 */

(function () {
  'use strict';

  var envInput = document.getElementById('envInput');
  var envOutput = document.getElementById('envOutput');
  var convertBtn = document.getElementById('convertBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyBtn = document.getElementById('copyBtn');
  var statusMsg = document.getElementById('statusMsg');
  var jsonToggle = document.getElementById('jsonToggle');
  var yamlToggle = document.getElementById('yamlToggle');

  if (!envInput) return;

  var currentFormat = 'json';
  var lastParsed = null;

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'status-msg show ' + type;
  }

  function hideStatus() {
    statusMsg.className = 'status-msg';
  }

  /**
   * Parses .env file content into a flat key-value object.
   * Handles: comments, blank lines, quoted values, inline comments after values.
   */
  function parseEnv(raw) {
    var result = {};
    var lines = raw.split(/\r?\n/);

    lines.forEach(function (line) {
      var trimmed = line.trim();

      // Skip blank lines and full-line comments
      if (!trimmed || trimmed.startsWith('#')) return;

      // Strip a leading "export " if present (common in shell-sourced env files)
      trimmed = trimmed.replace(/^export\s+/, '');

      var eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return; // not a valid KEY=VALUE line, skip

      var key = trimmed.slice(0, eqIndex).trim();
      var value = trimmed.slice(eqIndex + 1).trim();

      // Remove matching surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        // Strip inline comment for unquoted values (e.g. VALUE # comment)
        var commentIndex = value.indexOf(' #');
        if (commentIndex !== -1) {
          value = value.slice(0, commentIndex).trim();
        }
      }

      if (key) {
        result[key] = value;
      }
    });

    return result;
  }

  function toYaml(obj) {
    var keys = Object.keys(obj);
    if (keys.length === 0) return '';

    return keys.map(function (key) {
      var value = obj[key];
      var needsQuotes = /[:#\-\[\]{}]/.test(value) || value === '' || /^\s|\s$/.test(value);
      var yamlValue = needsQuotes ? '"' + value.replace(/"/g, '\\"') + '"' : value;
      return key + ': ' + yamlValue;
    }).join('\n');
  }

  function convert() {
    var raw = envInput.value;
    if (!raw || !raw.trim()) {
      showStatus('Paste your .env content first.', 'error');
      return;
    }

    var parsed = parseEnv(raw);
    var keyCount = Object.keys(parsed).length;

    if (keyCount === 0) {
      showStatus('No valid KEY=VALUE pairs found.', 'error');
      envOutput.value = '';
      return;
    }

    lastParsed = parsed;
    render();
    showStatus('Converted ' + keyCount + ' variable' + (keyCount === 1 ? '' : 's') + '.', 'success');
  }

  function render() {
    if (!lastParsed) return;
    if (currentFormat === 'json') {
      envOutput.value = JSON.stringify(lastParsed, null, 2);
    } else {
      envOutput.value = toYaml(lastParsed);
    }
  }

  convertBtn.addEventListener('click', convert);

  clearBtn.addEventListener('click', function () {
    envInput.value = '';
    envOutput.value = '';
    lastParsed = null;
    hideStatus();
  });

  jsonToggle.addEventListener('click', function () {
    currentFormat = 'json';
    jsonToggle.classList.add('active');
    yamlToggle.classList.remove('active');
    render();
  });

  yamlToggle.addEventListener('click', function () {
    currentFormat = 'yaml';
    yamlToggle.classList.add('active');
    jsonToggle.classList.remove('active');
    render();
  });

  copyBtn.addEventListener('click', function () {
    if (!envOutput.value) return;
    navigator.clipboard.writeText(envOutput.value).then(function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    }).catch(function () {
      envOutput.select();
      document.execCommand('copy');
    });
  });
})();
