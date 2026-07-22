/**
 * invoice-generator.js
 * Builds a live invoice preview and exports it as a PDF using jsPDF.
 * All computation happens client-side; jsPDF is loaded via CDN script tag.
 */

(function () {
  'use strict';

  var invoiceNumber = document.getElementById('invoiceNumber');
  var invoiceDate = document.getElementById('invoiceDate');
  var gstToggle = document.getElementById('gstToggle');
  var gstinField = document.getElementById('gstinField');
  var gstin = document.getElementById('gstin');
  var gstRateField = document.getElementById('gstRateField');
  var gstRate = document.getElementById('gstRate');
  var fromName = document.getElementById('fromName');
  var fromDetails = document.getElementById('fromDetails');
  var toName = document.getElementById('toName');
  var toDetails = document.getElementById('toDetails');
  var itemsContainer = document.getElementById('itemsContainer');
  var addItemBtn = document.getElementById('addItemBtn');
  var notes = document.getElementById('notes');
  var downloadPdfBtn = document.getElementById('downloadPdfBtn');
  var invoicePreview = document.getElementById('invoicePreview');

  if (!invoiceNumber) return;

  // Set default date to today if empty
  if (!invoiceDate.value) {
    invoiceDate.value = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function createItemRow(desc, qty, rate) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<input type="text" class="item-desc" placeholder="Description" value="' + escapeAttr(desc || '') + '">' +
      '<input type="number" class="item-qty" placeholder="Qty" value="' + (qty != null ? qty : 1) + '" min="0">' +
      '<input type="number" class="item-rate" placeholder="Rate (₹)" value="' + (rate != null ? rate : '') + '" min="0">' +
      '<button type="button" class="remove-item" aria-label="Remove item">×</button>';

    row.querySelector('.remove-item').addEventListener('click', function () {
      row.remove();
      renderPreview();
    });
    row.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', renderPreview);
    });

    itemsContainer.appendChild(row);
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

  function formatCurrency(n) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getItems() {
    var rows = itemsContainer.querySelectorAll('.item-row');
    var items = [];
    rows.forEach(function (row) {
      var desc = row.querySelector('.item-desc').value.trim();
      var qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      var rate = parseFloat(row.querySelector('.item-rate').value) || 0;
      if (desc) {
        items.push({ desc: desc, qty: qty, rate: rate, amount: qty * rate });
      }
    });
    return items;
  }

  function getInvoiceData() {
    var items = getItems();
    var subtotal = items.reduce(function (sum, item) { return sum + item.amount; }, 0);
    var isGst = gstToggle.value === 'gst';
    var rate = isGst ? (parseFloat(gstRate.value) || 0) : 0;
    var gstAmount = isGst ? subtotal * (rate / 100) : 0;
    var total = subtotal + gstAmount;

    return {
      invoiceNumber: invoiceNumber.value.trim() || 'INV-001',
      invoiceDate: invoiceDate.value.trim(),
      isGst: isGst,
      gstin: gstin.value.trim(),
      gstRate: rate,
      fromName: fromName.value.trim(),
      fromDetails: fromDetails.value.trim(),
      toName: toName.value.trim(),
      toDetails: toDetails.value.trim(),
      items: items,
      notes: notes.value.trim(),
      subtotal: subtotal,
      gstAmount: gstAmount,
      total: total
    };
  }

  function renderPreview() {
    var data = getInvoiceData();

    var rowsHtml = data.items.map(function (item) {
      return '<tr>' +
        '<td>' + escapeHtml(item.desc) + '</td>' +
        '<td class="text-right">' + item.qty + '</td>' +
        '<td class="text-right">' + formatCurrency(item.rate) + '</td>' +
        '<td class="text-right">' + formatCurrency(item.amount) + '</td>' +
        '</tr>';
    }).join('');

    var gstRowHtml = data.isGst
      ? '<div><span>GST (' + data.gstRate + '%)</span><span>' + formatCurrency(data.gstAmount) + '</span></div>'
      : '';

    invoicePreview.innerHTML =
      '<h2>INVOICE</h2>' +
      '<div class="inv-meta">' + escapeHtml(data.invoiceNumber) + ' &middot; ' + escapeHtml(data.invoiceDate) +
        (data.isGst && data.gstin ? ' &middot; GSTIN: ' + escapeHtml(data.gstin) : '') +
      '</div>' +
      '<div class="inv-parties">' +
        '<div class="inv-party"><strong>From</strong><span>' + escapeHtml(data.fromName) + (data.fromDetails ? '\n' + escapeHtml(data.fromDetails) : '') + '</span></div>' +
        '<div class="inv-party"><strong>Bill To</strong><span>' + escapeHtml(data.toName) + (data.toDetails ? '\n' + escapeHtml(data.toDetails) : '') + '</span></div>' +
      '</div>' +
      '<table>' +
        '<thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>' +
        '<tbody>' + (rowsHtml || '<tr><td colspan="4" style="color:#999;">No items added yet</td></tr>') + '</tbody>' +
      '</table>' +
      '<div class="inv-totals">' +
        '<div><span>Subtotal</span><span>' + formatCurrency(data.subtotal) + '</span></div>' +
        gstRowHtml +
        '<div class="grand-total"><span>Total</span><span>' + formatCurrency(data.total) + '</span></div>' +
      '</div>' +
      (data.notes ? '<div class="inv-notes">' + escapeHtml(data.notes) + '</div>' : '');
  }

  gstToggle.addEventListener('change', function () {
    var isGst = gstToggle.value === 'gst';
    gstinField.style.display = isGst ? 'flex' : 'none';
    gstRateField.style.display = isGst ? 'flex' : 'none';
    renderPreview();
  });

  [invoiceNumber, invoiceDate, gstin, gstRate, fromName, fromDetails, toName, toDetails, notes].forEach(function (el) {
    el.addEventListener('input', renderPreview);
  });

  addItemBtn.addEventListener('click', function () {
    createItemRow('', 1, '');
    renderPreview();
  });

  function generatePdf() {
    if (typeof window.jspdf === 'undefined') {
      alert('PDF library failed to load. Check your internet connection and try again.');
      return;
    }

    var data = getInvoiceData();
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'pt', format: 'a4' });
    var pageWidth = doc.internal.pageSize.getWidth();
    var margin = 48;
    var y = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('INVOICE', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    y += 20;
    var metaLine = data.invoiceNumber + '   |   ' + data.invoiceDate + (data.isGst && data.gstin ? '   |   GSTIN: ' + data.gstin : '');
    doc.text(metaLine, margin, y);

    y += 35;
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('From', margin, y);
    doc.text('Bill To', pageWidth / 2 + 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    var fromLines = (data.fromName + '\n' + data.fromDetails).split('\n');
    var toLines = (data.toName + '\n' + data.toDetails).split('\n');
    fromLines.forEach(function (line, i) { doc.text(line, margin, y + 16 + i * 13); });
    toLines.forEach(function (line, i) { doc.text(line, pageWidth / 2 + 10, y + 16 + i * 13); });

    y += 16 + Math.max(fromLines.length, toLines.length) * 13 + 25;

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setDrawColor(20);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
    doc.text('DESCRIPTION', margin, y);
    doc.text('QTY', pageWidth - 260, y);
    doc.text('RATE', pageWidth - 180, y);
    doc.text('AMOUNT', pageWidth - margin - 60, y);
    y += 6;
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    data.items.forEach(function (item) {
      doc.text(item.desc, margin, y, { maxWidth: pageWidth - margin - 260 });
      doc.text(String(item.qty), pageWidth - 260, y);
      doc.text('Rs. ' + item.rate.toFixed(2), pageWidth - 180, y);
      doc.text('Rs. ' + item.amount.toFixed(2), pageWidth - margin - 60, y);
      y += 18;
    });

    y += 10;
    doc.line(pageWidth - 220, y, pageWidth - margin, y);
    y += 16;

    doc.text('Subtotal', pageWidth - 220, y);
    doc.text('Rs. ' + data.subtotal.toFixed(2), pageWidth - margin - 60, y);

    if (data.isGst) {
      y += 16;
      doc.text('GST (' + data.gstRate + '%)', pageWidth - 220, y);
      doc.text('Rs. ' + data.gstAmount.toFixed(2), pageWidth - margin - 60, y);
    }

    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total', pageWidth - 220, y);
    doc.text('Rs. ' + data.total.toFixed(2), pageWidth - margin - 60, y);

    if (data.notes) {
      y += 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(data.notes, margin, y, { maxWidth: pageWidth - margin * 2 });
    }

    doc.save(data.invoiceNumber + '.pdf');
  }

  downloadPdfBtn.addEventListener('click', generatePdf);

  // Seed one example item and render initial preview
  createItemRow('Website design & development', 1, 25000);
  renderPreview();
})();
