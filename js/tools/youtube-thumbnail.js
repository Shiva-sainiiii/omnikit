/**
 * youtube-thumbnail.js
 * Extracts the video ID from a YouTube URL and builds direct links to
 * YouTube's publicly hosted thumbnail images at various resolutions.
 * No API calls — YouTube's thumbnail URLs follow a predictable pattern.
 */

(function () {
  'use strict';

  var videoUrl = document.getElementById('videoUrl');
  var fetchBtn = document.getElementById('fetchBtn');
  var statusMsg = document.getElementById('statusMsg');
  var thumbGrid = document.getElementById('thumbGrid');

  if (!videoUrl) return;

  var sizes = [
    { key: 'maxresdefault', label: 'Max HD (1280×720)' },
    { key: 'sddefault', label: 'Standard (640×480)' },
    { key: 'hqdefault', label: 'High Quality (480×360)' },
    { key: 'mqdefault', label: 'Medium Quality (320×180)' },
    { key: 'default', label: 'Default (120×90)' }
  ];

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'status-msg show ' + type;
  }

  function hideStatus() {
    statusMsg.className = 'status-msg';
  }

  /**
   * Extracts an 11-character YouTube video ID from various URL formats:
   * - youtube.com/watch?v=ID
   * - youtu.be/ID
   * - youtube.com/shorts/ID
   * - youtube.com/embed/ID
   */
  function extractVideoId(url) {
    var trimmed = url.trim();

    var patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = trimmed.match(patterns[i]);
      if (match) return match[1];
    }

    // Fallback: maybe the user just pasted the raw ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  function buildThumbCard(videoId, size) {
    var card = document.createElement('div');
    card.className = 'thumb-card';

    var img = document.createElement('img');
    img.src = 'https://img.youtube.com/vi/' + videoId + '/' + size.key + '.jpg';
    img.alt = size.label + ' thumbnail';
    img.loading = 'lazy';

    // maxresdefault falls back to a small placeholder if unavailable —
    // detect that case (120x90 dimensions) and hide the card.
    img.addEventListener('load', function () {
      if (size.key === 'maxresdefault' && img.naturalWidth === 120) {
        card.style.display = 'none';
      }
    });

    var footer = document.createElement('div');
    footer.className = 'thumb-card-footer';
    footer.innerHTML =
      '<span>' + size.label + '</span>' +
      '<a href="' + img.src + '" download="thumbnail-' + size.key + '.jpg" target="_blank" rel="noopener">Download ↓</a>';

    card.appendChild(img);
    card.appendChild(footer);
    return card;
  }

  function fetchThumbnails() {
    var url = videoUrl.value;
    if (!url || !url.trim()) {
      showStatus('Paste a YouTube video URL first.', 'error');
      thumbGrid.classList.remove('show');
      return;
    }

    var videoId = extractVideoId(url);
    if (!videoId) {
      showStatus('Could not find a valid YouTube video ID in that URL.', 'error');
      thumbGrid.classList.remove('show');
      return;
    }

    thumbGrid.innerHTML = '';
    sizes.forEach(function (size) {
      thumbGrid.appendChild(buildThumbCard(videoId, size));
    });
    thumbGrid.classList.add('show');
    showStatus('Thumbnails loaded for video ID: ' + videoId, 'success');
  }

  fetchBtn.addEventListener('click', fetchThumbnails);
  videoUrl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') fetchThumbnails();
  });
})();
