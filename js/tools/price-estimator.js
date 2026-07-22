/**
 * price-estimator.js
 * Calculates a freelance project quote from task-level hour estimates,
 * hourly rate, contingency buffer, and urgency multiplier.
 * Fully client-side.
 */

(function () {
  'use strict';

  var hourlyRate = document.getElementById('hourlyRate');
  var tasksContainer = document.getElementById('tasksContainer');
  var addTaskBtn = document.getElementById('addTaskBtn');
  var bufferPercent = document.getElementById('bufferPercent');
  var urgencyMultiplier = document.getElementById('urgencyMultiplier');
  var quoteSummary = document.getElementById('quoteSummary');

  if (!hourlyRate) return;

  function formatCurrency(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  function createTaskRow(name, hours) {
    var row = document.createElement('div');
    row.className = 'task-row';
    row.innerHTML =
      '<input type="text" class="task-name" placeholder="Task, e.g. Homepage design" value="' + escapeAttr(name || '') + '">' +
      '<input type="number" class="task-hours" placeholder="Hours" value="' + (hours != null ? hours : '') + '" min="0" step="0.5">' +
      '<button type="button" class="remove-task" aria-label="Remove task">×</button>';

    row.querySelector('.remove-task').addEventListener('click', function () {
      row.remove();
      render();
    });
    row.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', render);
    });

    tasksContainer.appendChild(row);
  }

  function getTasks() {
    var rows = tasksContainer.querySelectorAll('.task-row');
    var tasks = [];
    rows.forEach(function (row) {
      var name = row.querySelector('.task-name').value.trim();
      var hours = parseFloat(row.querySelector('.task-hours').value) || 0;
      if (name && hours > 0) {
        tasks.push({ name: name, hours: hours });
      }
    });
    return tasks;
  }

  function render() {
    var tasks = getTasks();
    var rate = parseFloat(hourlyRate.value) || 0;
    var buffer = parseFloat(bufferPercent.value) || 0;
    var multiplier = parseFloat(urgencyMultiplier.value) || 1;

    var totalHours = tasks.reduce(function (sum, t) { return sum + t.hours; }, 0);
    var baseCost = totalHours * rate;
    var bufferAmount = baseCost * (buffer / 100);
    var subtotal = baseCost + bufferAmount;
    var finalTotal = subtotal * multiplier;
    var urgencyAmount = finalTotal - subtotal;

    var taskRowsHtml = tasks.map(function (t) {
      return '<div class="quote-row"><span>' + escapeAttr(t.name) + ' (' + t.hours + 'h)</span><span>' + formatCurrency(t.hours * rate) + '</span></div>';
    }).join('');

    quoteSummary.innerHTML =
      (taskRowsHtml || '<div class="quote-row"><span>No tasks added yet</span><span>—</span></div>') +
      '<div class="quote-row"><span>Total hours</span><span>' + totalHours + 'h</span></div>' +
      '<div class="quote-row"><span>Base cost</span><span>' + formatCurrency(baseCost) + '</span></div>' +
      '<div class="quote-row"><span>Buffer (' + buffer + '%)</span><span>' + formatCurrency(bufferAmount) + '</span></div>' +
      (multiplier > 1
        ? '<div class="quote-row"><span>Urgency premium</span><span>' + formatCurrency(urgencyAmount) + '</span></div>'
        : '') +
      '<div class="quote-row total"><span>Total quote</span><span class="quote-total-amount">' + formatCurrency(finalTotal) + '</span></div>';
  }

  [hourlyRate, bufferPercent, urgencyMultiplier].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  addTaskBtn.addEventListener('click', function () {
    createTaskRow('', '');
    render();
  });

  // Seed with a couple of example tasks
  createTaskRow('Discovery & planning', 3);
  createTaskRow('Design', 8);
  createTaskRow('Development', 20);
  render();
})();
