/**
 * caption-spacer.js
 * Inserts invisible/visible spacer lines between caption paragraphs
 * and appends a cleanly separated hashtag block.
 * Fully client-side.
 */

(function () {
  'use strict';

  var captionInput = document.getElementById('captionInput');
  var hashtagsInput = document.getElementById('hashtagsInput');
  var captionOutput = document.getElementById('captionOutput');
  var spacerStyle = document.getElementById('spacerStyle');
  var generateBtn = document.getElementById('generateBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyBtn = document.getElementById('copyBtn');

  if (!captionInput) return;

  // U+2800 Braille Pattern Blank — renders as invisible whitespace
  // but isn't a "true" empty line, so Instagram won't collapse it.
  var BRAILLE_BLANK = '\u2800';

  function getSpacerLine(style) {
    if (style === 'dot') return '·';
    if (style === 'dashes') return '－－－';
    return BRAILLE_BLANK; // blank invisible
  }

  function buildCaption() {
    var captionRaw = captionInput.value;
    var hashtagsRaw = hashtagsInput.value.trim();
    var style = spacerStyle.value;
    var spacer = getSpacerLine(style);

    // Split caption into paragraphs (blocks separated by blank lines)
    var paragraphs = captionRaw
      .split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean);

    var body = paragraphs.join('\n' + spacer + '\n');

    if (hashtagsRaw) {
      // Normalize hashtags into a single space-separated line
      var tags = hashtagsRaw.split(/\s+/).filter(Boolean).join(' ');
      var spacerBlock = [spacer, spacer, spacer].join('\n');
      body += '\n' + spacerBlock + '\n' + tags;
    }

    return body;
  }

  generateBtn.addEventListener('click', function () {
    captionOutput.value = buildCaption();
  });

  clearBtn.addEventListener('click', function () {
    captionInput.value = '';
    hashtagsInput.value = '';
    captionOutput.value = '';
  });

  copyBtn.addEventListener('click', function () {
    if (!captionOutput.value) return;
    navigator.clipboard.writeText(captionOutput.value).then(function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    }).catch(function () {
      captionOutput.select();
      document.execCommand('copy');
    });
  });
})();
