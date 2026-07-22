/**
 * thread-splitter.js
 * Splits long text into numbered posts fitting a character limit,
 * breaking at sentence boundaries first, then word boundaries.
 * Fully client-side.
 */

(function () {
  'use strict';

  var sourceText = document.getElementById('sourceText');
  var charCount = document.getElementById('charCount');
  var platform = document.getElementById('platform');
  var numbering = document.getElementById('numbering');
  var splitBtn = document.getElementById('splitBtn');
  var clearBtn = document.getElementById('clearBtn');
  var tweetList = document.getElementById('tweetList');

  if (!sourceText) return;

  sourceText.addEventListener('input', function () {
    charCount.textContent = sourceText.value.length;
  });

  function getNumberSuffix(style, index, total) {
    if (style === 'slash') return ' ' + (index + 1) + '/' + total;
    if (style === 'paren') return ' (' + (index + 1) + '/' + total + ')';
    return '';
  }

  /**
   * Splits text into sentences using a simple punctuation-based approach.
   * Keeps the punctuation attached to its sentence.
   */
  function splitIntoSentences(text) {
    var matches = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
    return matches ? matches.map(function (s) { return s.trim(); }).filter(Boolean) : [text];
  }

  /**
   * Packs sentences into chunks that fit within maxLen, reserving room
   * for the numbering suffix. Falls back to word-level splitting for
   * any single sentence that's longer than maxLen on its own.
   */
  function packIntoChunks(sentences, maxLen) {
    var chunks = [];
    var current = '';

    sentences.forEach(function (sentence) {
      if (sentence.length > maxLen) {
        // Sentence itself is too long — split by words
        if (current) {
          chunks.push(current.trim());
          current = '';
        }
        var words = sentence.split(' ');
        var wordChunk = '';
        words.forEach(function (word) {
          var candidate = wordChunk ? wordChunk + ' ' + word : word;
          if (candidate.length > maxLen) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk = candidate;
          }
        });
        if (wordChunk) current = wordChunk;
        return;
      }

      var combined = current ? current + ' ' + sentence : sentence;
      if (combined.length > maxLen) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = combined;
      }
    });

    if (current) chunks.push(current.trim());
    return chunks;
  }

  function renderTweetCard(text, index, total, limit) {
    var card = document.createElement('div');
    card.className = 'tweet-card';

    var isOver = text.length > limit;
    card.innerHTML =
      '<div class="tweet-card-header">' +
        '<span>Post ' + (index + 1) + ' of ' + total + '</span>' +
        '<span class="' + (isOver ? 'count-warn' : '') + '">' + text.length + ' / ' + limit + '</span>' +
      '</div>' +
      '<div class="tweet-card-body"></div>' +
      '<div style="margin-top: 0.6rem;"><button class="copy-one">Copy this post</button></div>';

    card.querySelector('.tweet-card-body').textContent = text;
    card.querySelector('.copy-one').addEventListener('click', function (e) {
      navigator.clipboard.writeText(text).then(function () {
        e.target.textContent = 'Copied!';
        setTimeout(function () { e.target.textContent = 'Copy this post'; }, 1200);
      });
    });

    return card;
  }

  function split() {
    var text = sourceText.value.trim();
    tweetList.innerHTML = '';

    if (!text) return;

    var limit = parseInt(platform.value, 10);
    var numStyle = numbering.value;

    // Reserve space for numbering suffix (worst case, e.g. " (10/10)")
    var reserved = numStyle === 'none' ? 0 : 8;
    var effectiveLimit = limit - reserved;

    var sentences = splitIntoSentences(text);
    var chunks = packIntoChunks(sentences, effectiveLimit);
    var total = chunks.length;

    chunks.forEach(function (chunk, i) {
      var suffix = getNumberSuffix(numStyle, i, total);
      var finalText = chunk + suffix;
      tweetList.appendChild(renderTweetCard(finalText, i, total, limit));
    });
  }

  splitBtn.addEventListener('click', split);

  clearBtn.addEventListener('click', function () {
    sourceText.value = '';
    charCount.textContent = '0';
    tweetList.innerHTML = '';
  });
})();
