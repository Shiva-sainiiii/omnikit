/**
 * image-converter.js
 * Converts images to WebP or AVIF using the Canvas API.
 * Runs fully client-side — files never leave the browser.
 */

(function () {
  'use strict';

  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var outputFormat = document.getElementById('outputFormat');
  var qualitySlider = document.getElementById('qualitySlider');
  var qualityValue = document.getElementById('qualityValue');
  var fileGrid = document.getElementById('fileGrid');
  var bulkActions = document.getElementById('bulkActions');
  var downloadAllBtn = document.getElementById('downloadAllBtn');
  var clearAllBtn = document.getElementById('clearAllBtn');

  if (!dropZone) return;

  var convertedFiles = []; // { name, url, blob, originalSize, newSize }

  qualitySlider.addEventListener('input', function () {
    qualityValue.textContent = qualitySlider.value;
  });

  dropZone.addEventListener('click', function () {
    fileInput.click();
  });

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', function () {
    handleFiles(fileInput.files);
    fileInput.value = ''; // allow re-selecting the same file
  });

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleFiles(fileList) {
    var files = Array.from(fileList).filter(function (f) {
      return f.type.startsWith('image/');
    });

    files.forEach(function (file) {
      var card = createFileCard(file);
      fileGrid.appendChild(card);
      convertImage(file, card);
    });

    if (fileGrid.children.length > 0) {
      bulkActions.style.display = 'flex';
    }
  }

  function createFileCard(file) {
    var card = document.createElement('div');
    card.className = 'file-card processing';

    var img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    var body = document.createElement('div');
    body.className = 'file-card-body';
    body.innerHTML =
      '<div class="file-card-name">' + escapeHtml(file.name) + '</div>' +
      '<div class="file-card-stats"><span>' + formatBytes(file.size) + '</span><span class="new-size">Converting…</span></div>';

    var footer = document.createElement('div');
    footer.className = 'file-card-footer';
    footer.innerHTML = '<a href="#" class="download-link">Processing…</a>';

    card.appendChild(img);
    card.appendChild(body);
    card.appendChild(footer);
    return card;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getOutputExtension(mimeType) {
    return mimeType === 'image/avif' ? 'avif' : 'webp';
  }

  function convertImage(file, card) {
    var format = outputFormat.value;
    var quality = parseInt(qualitySlider.value, 10) / 100;

    var img = new Image();
    var objectUrl = URL.createObjectURL(file);

    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function (blob) {
        URL.revokeObjectURL(objectUrl);

        if (!blob) {
          // Format not supported by this browser (common for AVIF)
          card.classList.remove('processing');
          card.querySelector('.new-size').textContent = 'Unsupported format';
          card.querySelector('.download-link').textContent = 'Not available';
          return;
        }

        var ext = getOutputExtension(format);
        var newName = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
        var url = URL.createObjectURL(blob);
        var savings = ((1 - blob.size / file.size) * 100).toFixed(0);

        card.classList.remove('processing');
        var statsEl = card.querySelector('.new-size');
        statsEl.innerHTML = formatBytes(blob.size) + (savings > 0 ? ' <span class="savings">(-' + savings + '%)</span>' : '');

        var link = card.querySelector('.download-link');
        link.href = url;
        link.download = newName;
        link.textContent = 'Download ↓';

        convertedFiles.push({ name: newName, url: url, blob: blob });
      }, format, quality);
    };

    img.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      card.classList.remove('processing');
      card.querySelector('.new-size').textContent = 'Failed to load';
    };

    img.src = objectUrl;
  }

  downloadAllBtn.addEventListener('click', function () {
    convertedFiles.forEach(function (f) {
      var a = document.createElement('a');
      a.href = f.url;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });

  clearAllBtn.addEventListener('click', function () {
    fileGrid.innerHTML = '';
    convertedFiles = [];
    bulkActions.style.display = 'none';
  });
})();
