/**
 * tax-calculator.js
 * Calculates Indian income tax under both New and Old regimes for
 * FY 2026-27 (AY 2027-28) and renders a side-by-side comparison.
 * Fully client-side.
 *
 * Figures used (verified as of Jul 2026):
 * NEW REGIME slabs: 0-4L nil, 4-8L 5%, 8-12L 10%, 12-16L 15%,
 *                    16-20L 20%, 20-24L 25%, 24L+ 30%
 * NEW REGIME rebate (87A): taxable income <= 12L => rebate up to 60,000
 * NEW REGIME standard deduction (salaried): 75,000
 * OLD REGIME slabs (below 60): 0-2.5L nil, 2.5-5L 5%, 5-10L 20%, 10L+ 30%
 * OLD REGIME senior (60-80): 0-3L nil, 3-5L 5%, 5-10L 20%, 10L+ 30%
 * OLD REGIME super senior (80+): 0-5L nil, 5-10L 20%, 10L+ 30%
 * OLD REGIME rebate (87A): taxable income <= 5L => rebate up to 12,500
 * OLD REGIME standard deduction (salaried): 50,000
 * Cess: 4% Health & Education cess on tax (after rebate) in both regimes.
 * Surcharge is not included — applies only above 50L and adds complexity
 * beyond what a quick planning estimate needs.
 */

(function () {
  'use strict';

  var incomeInput = document.getElementById('income');
  var isSalariedSelect = document.getElementById('isSalaried');
  var ageGroupSelect = document.getElementById('ageGroup');
  var deductionsInput = document.getElementById('deductions');
  var compareGrid = document.getElementById('compareGrid');
  var savingsNote = document.getElementById('savingsNote');

  if (!incomeInput) return;

  function formatCurrency(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function applySlabs(taxableIncome, slabs) {
    var tax = 0;
    var remaining = taxableIncome;
    var lastCap = 0;

    for (var i = 0; i < slabs.length; i++) {
      var slab = slabs[i];
      var cap = slab.upTo === null ? Infinity : slab.upTo;
      var slabWidth = cap - lastCap;
      var taxableInSlab = Math.min(Math.max(taxableIncome - lastCap, 0), slabWidth);
      tax += taxableInSlab * slab.rate;
      lastCap = cap;
      if (taxableIncome <= cap) break;
    }
    return tax;
  }

  function calcNewRegime(income, isSalaried) {
    var stdDeduction = isSalaried ? 75000 : 0;
    var taxableIncome = Math.max(income - stdDeduction, 0);

    var slabs = [
      { upTo: 400000, rate: 0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.10 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.20 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: null, rate: 0.30 }
    ];

    var tax = applySlabs(taxableIncome, slabs);

    // Section 87A rebate: taxable income <= 12L => full rebate (tax becomes 0), capped at 60,000
    var rebate = 0;
    if (taxableIncome <= 1200000) {
      rebate = Math.min(tax, 60000);
    }

    var taxAfterRebate = Math.max(tax - rebate, 0);
    var cess = taxAfterRebate * 0.04;
    var totalTax = taxAfterRebate + cess;

    return {
      taxableIncome: taxableIncome,
      stdDeduction: stdDeduction,
      taxBeforeRebate: tax,
      rebate: rebate,
      cess: cess,
      totalTax: totalTax
    };
  }

  function calcOldRegime(income, isSalaried, ageGroup, deductions) {
    var stdDeduction = isSalaried ? 50000 : 0;
    var taxableIncome = Math.max(income - stdDeduction - deductions, 0);

    var slabsByAge = {
      below60: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: null, rate: 0.30 }
      ],
      senior: [
        { upTo: 300000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: null, rate: 0.30 }
      ],
      supersenior: [
        { upTo: 500000, rate: 0 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: null, rate: 0.30 }
      ]
    };

    var slabs = slabsByAge[ageGroup] || slabsByAge.below60;
    var tax = applySlabs(taxableIncome, slabs);

    // Section 87A rebate: taxable income <= 5L => full rebate, capped at 12,500
    var rebate = 0;
    if (taxableIncome <= 500000) {
      rebate = Math.min(tax, 12500);
    }

    var taxAfterRebate = Math.max(tax - rebate, 0);
    var cess = taxAfterRebate * 0.04;
    var totalTax = taxAfterRebate + cess;

    return {
      taxableIncome: taxableIncome,
      stdDeduction: stdDeduction,
      deductions: deductions,
      taxBeforeRebate: tax,
      rebate: rebate,
      cess: cess,
      totalTax: totalTax
    };
  }

  function renderRegimeCard(title, result, isWinner, extraRows) {
    var badge = isWinner ? '<span class="winner-badge">Better option</span>' : '';
    var rows = extraRows.map(function (row) {
      return '<div class="breakdown-row"><span>' + row[0] + '</span><span>' + row[1] + '</span></div>';
    }).join('');

    return '<div class="regime-card' + (isWinner ? ' winner' : '') + '">' +
      '<h3>' + title + ' ' + badge + '</h3>' +
      '<div class="tax-amount">' + formatCurrency(result.totalTax) + '</div>' +
      '<div class="breakdown-row"><span>Taxable income</span><span>' + formatCurrency(result.taxableIncome) + '</span></div>' +
      rows +
      '<div class="breakdown-row"><span>Cess (4%)</span><span>' + formatCurrency(result.cess) + '</span></div>' +
      '<div class="breakdown-row"><span>Total tax payable</span><span>' + formatCurrency(result.totalTax) + '</span></div>' +
      '</div>';
  }

  function render() {
    var income = parseFloat(incomeInput.value) || 0;
    var isSalaried = isSalariedSelect.value === 'salaried';
    var ageGroup = ageGroupSelect.value;
    var deductions = parseFloat(deductionsInput.value) || 0;

    var newResult = calcNewRegime(income, isSalaried);
    var oldResult = calcOldRegime(income, isSalaried, ageGroup, deductions);

    var newIsWinner = newResult.totalTax < oldResult.totalTax;
    var oldIsWinner = oldResult.totalTax < newResult.totalTax;

    compareGrid.innerHTML =
      renderRegimeCard('New Regime', newResult, newIsWinner, [
        ['Standard deduction', formatCurrency(newResult.stdDeduction)],
        ['87A rebate', formatCurrency(newResult.rebate)]
      ]) +
      renderRegimeCard('Old Regime', oldResult, oldIsWinner, [
        ['Standard deduction', formatCurrency(oldResult.stdDeduction)],
        ['Other deductions', formatCurrency(oldResult.deductions)],
        ['87A rebate', formatCurrency(oldResult.rebate)]
      ]);

    var diff = Math.abs(newResult.totalTax - oldResult.totalTax);
    if (diff === 0) {
      savingsNote.textContent = 'Both regimes result in the same tax liability.';
    } else {
      var betterRegime = newResult.totalTax < oldResult.totalTax ? 'New Regime' : 'Old Regime';
      savingsNote.textContent = betterRegime + ' saves you ' + formatCurrency(diff) + ' compared to the other option.';
    }
  }

  [incomeInput, isSalariedSelect, ageGroupSelect, deductionsInput].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();
})();
