/**
 * markdown-to-pdf.js
 * Renders Markdown live using marked.js, and exports the styled result
 * as either a PDF (via html2canvas + jsPDF) or a standalone HTML file.
 * All processing is client-side; libraries are loaded via CDN.
 */

(function () {
  'use strict';

  var markdownInput = document.getElementById('markdownInput');
  var markdownPreview = document.getElementById('markdownPreview');
  var themeSelect = document.getElementById('themeSelect');
  var downloadPdfBtn = document.getElementById('downloadPdfBtn');
  var downloadHtmlBtn = document.getElementById('downloadHtmlBtn');

  if (!markdownInput) return;

  function render() {
    if (typeof marked === 'undefined') {
      markdownPreview.textContent = 'Markdown library failed to load. Check your internet connection.';
      return;
    }
    var html = marked.parse(markdownInput.value);
    markdownPreview.innerHTML = html;
  }

  function applyTheme() {
    var theme = themeSelect.value;
    markdownPreview.className = 'markdown-preview theme-' + theme;
  }

  markdownInput.addEventListener('input', render);
  themeSelect.addEventListener('change', function () {
    applyTheme();
  });

  function buildStandaloneHtml() {
    var theme = themeSelect.value;
    var bodyHtml = markdownPreview.innerHTML;

    var fontStack = theme === 'editorial'
      ? "Georgia, 'Times New Roman', serif"
      : "'Inter', -apple-system, sans-serif";
    var headingFont = theme === 'technical'
      ? "'JetBrains Mono', monospace"
      : fontStack;

    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Document</title>\n<style>\n' +
      'body { font-family: ' + fontStack + '; max-width: 720px; margin: 2rem auto; padding: 0 1.5rem; color: #1a1a1a; line-height: 1.7; }\n' +
      'h1, h2, h3 { font-family: ' + headingFont + '; margin-top: 1.2em; margin-bottom: 0.5em; }\n' +
      'blockquote { border-left: 3px solid #ccc; padding-left: 1em; margin: 1em 0; color: #555; font-style: italic; }\n' +
      'code { background: #f2f2f2; padding: 0.15em 0.4em; border-radius: 3px; }\n' +
      'pre { background: #f2f2f2; padding: 1em; border-radius: 6px; overflow-x: auto; }\n' +
      'pre code { background: none; padding: 0; }\n' +
      'a { color: #3a6b4f; }\n' +
      '</style>\n</head>\n<body>\n' + bodyHtml + '\n</body>\n</html>';
  }

  downloadHtmlBtn.addEventListener('click', function () {
    var html = buildStandaloneHtml();
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  function generatePdf() {
    if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      alert('PDF export library failed to load. Check your internet connection and try again.');
      return;
    }

    var originalText = downloadPdfBtn.textContent;
    downloadPdfBtn.textContent = 'Generating…';
    downloadPdfBtn.disabled = true;

    // Render preview into a fixed-width offscreen container for consistent PDF output
    var exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '720px';
    exportContainer.style.background = '#fff';
    exportContainer.style.padding = '40px';
    exportContainer.className = markdownPreview.className;
    exportContainer.innerHTML = markdownPreview.innerHTML;
    document.body.appendChild(exportContainer);

    html2canvas(exportContainer, { scale: 2, backgroundColor: '#ffffff' }).then(function (canvas) {
      document.body.removeChild(exportContainer);

      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      var pageWidth = pdf.internal.pageSize.getWidth();
      var pageHeight = pdf.internal.pageSize.getHeight();

      var imgWidth = pageWidth;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;

      var imgData = canvas.toDataURL('image/png');
      var heightLeft = imgHeight;
      var position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('document.pdf');
      downloadPdfBtn.textContent = originalText;
      downloadPdfBtn.disabled = false;
    }).catch(function (err) {
      document.body.removeChild(exportContainer);
      alert('PDF generation failed: ' + err.message);
      downloadPdfBtn.textContent = originalText;
      downloadPdfBtn.disabled = false;
    });
  }

  downloadPdfBtn.addEventListener('click', generatePdf);

  // Initial render
  applyTheme();
  render();
})();
