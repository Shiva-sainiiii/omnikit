/**
 * bio-link-generator.js
 * Builds a live preview of a bio-link page and lets the user download
 * it as a single standalone HTML file. Fully client-side.
 */

(function () {
  'use strict';

  var profileName = document.getElementById('profileName');
  var profileBio = document.getElementById('profileBio');
  var profileImg = document.getElementById('profileImg');
  var accentColor = document.getElementById('accentColor');
  var linksContainer = document.getElementById('linksContainer');
  var addLinkBtn = document.getElementById('addLinkBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var previewFrame = document.getElementById('previewFrame');

  if (!profileName) return;

  var linkIdCounter = 0;

  function createLinkRow(label, url) {
    linkIdCounter++;
    var row = document.createElement('div');
    row.className = 'link-row';
    row.dataset.id = linkIdCounter;
    row.innerHTML =
      '<input type="text" class="link-label" placeholder="Label, e.g. Instagram" value="' + escapeAttr(label || '') + '">' +
      '<input type="url" class="link-url" placeholder="https://instagram.com/you" value="' + escapeAttr(url || '') + '">' +
      '<button type="button" class="remove-link" aria-label="Remove link">×</button>';

    row.querySelector('.remove-link').addEventListener('click', function () {
      row.remove();
      updatePreview();
    });
    row.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', updatePreview);
    });

    linksContainer.appendChild(row);
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getLinks() {
    var rows = linksContainer.querySelectorAll('.link-row');
    var links = [];
    rows.forEach(function (row) {
      var label = row.querySelector('.link-label').value.trim();
      var url = row.querySelector('.link-url').value.trim();
      if (label && url) {
        links.push({ label: label, url: url });
      }
    });
    return links;
  }

  function buildPageHtml() {
    var name = profileName.value.trim() || 'Your Name';
    var bio = profileBio.value.trim() || '';
    var img = profileImg.value.trim();
    var accent = accentColor.value || '#7C9885';
    var links = getLinks();

    var linksHtml = links.map(function (link) {
      return '<a class="bl-link" href="' + escapeAttr(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.label) + '</a>';
    }).join('\n      ');

    var avatarHtml = img
      ? '<img class="bl-avatar" src="' + escapeAttr(img) + '" alt="' + escapeAttr(name) + '">'
      : '<div class="bl-avatar bl-avatar-placeholder">' + escapeHtml((name || '?').charAt(0).toUpperCase()) + '</div>';

    return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>' + escapeHtml(name) + '</title>\n' +
'<style>\n' +
'  :root { --accent: ' + accent + '; }\n' +
'  * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'  body {\n' +
'    background: #0F1115;\n' +
'    color: #E8EAED;\n' +
'    font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;\n' +
'    min-height: 100vh;\n' +
'    display: flex;\n' +
'    align-items: center;\n' +
'    justify-content: center;\n' +
'    padding: 2rem 1rem;\n' +
'  }\n' +
'  .bl-card { max-width: 420px; width: 100%; text-align: center; }\n' +
'  .bl-avatar {\n' +
'    width: 96px; height: 96px; border-radius: 50%;\n' +
'    object-fit: cover; margin: 0 auto 1rem; display: block;\n' +
'    border: 2px solid var(--accent);\n' +
'  }\n' +
'  .bl-avatar-placeholder {\n' +
'    display: flex; align-items: center; justify-content: center;\n' +
'    background: var(--accent); color: #0F1115;\n' +
'    font-size: 2rem; font-weight: 700;\n' +
'  }\n' +
'  .bl-name { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.4rem; }\n' +
'  .bl-bio { color: #9AA1AC; font-size: 0.95rem; margin-bottom: 1.8rem; }\n' +
'  .bl-link {\n' +
'    display: block; background: #161A21; border: 1px solid #2A2F3A;\n' +
'    color: #E8EAED; text-decoration: none; padding: 0.9rem 1rem;\n' +
'    border-radius: 10px; margin-bottom: 0.75rem; font-weight: 500;\n' +
'    transition: border-color 0.15s ease, transform 0.15s ease;\n' +
'  }\n' +
'  .bl-link:hover { border-color: var(--accent); transform: translateY(-1px); }\n' +
'  .bl-footer { margin-top: 2rem; font-size: 0.75rem; color: #565D68; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="bl-card">\n' +
'    ' + avatarHtml + '\n' +
'    <div class="bl-name">' + escapeHtml(name) + '</div>\n' +
'    <div class="bl-bio">' + escapeHtml(bio) + '</div>\n' +
'    <div class="bl-links">\n' +
'      ' + (linksHtml || '<p style="color:#565D68;font-size:0.85rem;">No links added yet</p>') + '\n' +
'    </div>\n' +
'    <div class="bl-footer">Made with OmniKit</div>\n' +
'  </div>\n' +
'</body>\n' +
'</html>';
  }

  function updatePreview() {
    var html = buildPageHtml();
    previewFrame.srcdoc = html;
  }

  addLinkBtn.addEventListener('click', function () {
    createLinkRow('', '');
    updatePreview();
  });

  [profileName, profileBio, profileImg, accentColor].forEach(function (el) {
    el.addEventListener('input', updatePreview);
  });

  downloadBtn.addEventListener('click', function () {
    var html = buildPageHtml();
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var filename = (profileName.value.trim() || 'bio-link').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = filename + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Seed with two example links so preview isn't empty on load
  createLinkRow('Instagram', 'https://instagram.com/yourhandle');
  createLinkRow('YouTube', 'https://youtube.com/@yourhandle');
  updatePreview();
})();
