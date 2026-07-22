/**
 * margin-calculator.js
 * Calculates true net profit per unit and per month for e-commerce
 * sellers, factoring in RTO losses, forward/reverse shipping,
 * platform commission, and payment gateway fees.
 * Fully client-side.
 */

(function () {
  'use strict';

  var sellingPrice = document.getElementById('sellingPrice');
  var costPrice = document.getElementById('costPrice');
  var forwardShipping = document.getElementById('forwardShipping');
  var reverseShipping = document.getElementById('reverseShipping');
  var platformFeePercent = document.getElementById('platformFeePercent');
  var paymentGatewayPercent = document.getElementById('paymentGatewayPercent');
  var rtoRate = document.getElementById('rtoRate');
  var ordersPerMonth = document.getElementById('ordersPerMonth');
  var resultSummary = document.getElementById('resultSummary');

  if (!sellingPrice) return;

  function formatCurrency(n) {
    var sign = n < 0 ? '-' : '';
    return sign + '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
  }

  function calculate() {
    var price = parseFloat(sellingPrice.value) || 0;
    var cost = parseFloat(costPrice.value) || 0;
    var fwdShip = parseFloat(forwardShipping.value) || 0;
    var revShip = parseFloat(reverseShipping.value) || 0;
    var platformPct = parseFloat(platformFeePercent.value) || 0;
    var gatewayPct = parseFloat(paymentGatewayPercent.value) || 0;
    var rtoPct = (parseFloat(rtoRate.value) || 0) / 100;
    var orders = parseFloat(ordersPerMonth.value) || 0;

    // --- Successful (delivered) order economics ---
    var platformFee = price * (platformPct / 100);
    var gatewayFee = price * (gatewayPct / 100);
    var deliveredProfit = price - cost - fwdShip - platformFee - gatewayFee;

    // --- RTO (returned) order economics: no revenue, but shipping both ways + cost is lost ---
    // Product cost is typically recoverable (item returns to inventory), so we exclude COGS
    // from the RTO loss, but include both shipping legs which are non-recoverable.
    var rtoLoss = fwdShip + revShip;

    // --- Blended average profit per order, accounting for RTO probability ---
    var deliveredRate = 1 - rtoPct;
    var blendedProfitPerOrder = (deliveredRate * deliveredProfit) - (rtoPct * rtoLoss);

    // --- Monthly projection ---
    var monthlyRevenue = orders * deliveredRate * price;
    var monthlyProfit = orders * blendedProfitPerOrder;

    var marginPercent = price > 0 ? (blendedProfitPerOrder / price) * 100 : 0;

    return {
      platformFee: platformFee,
      gatewayFee: gatewayFee,
      deliveredProfit: deliveredProfit,
      rtoLoss: rtoLoss,
      rtoPct: rtoPct * 100,
      blendedProfitPerOrder: blendedProfitPerOrder,
      monthlyRevenue: monthlyRevenue,
      monthlyProfit: monthlyProfit,
      marginPercent: marginPercent,
      orders: orders
    };
  }

  function getMarginBadge(marginPercent) {
    if (marginPercent < 0) return { text: 'Losing money per order', cls: 'negative' };
    if (marginPercent < 10) return { text: 'Thin margin (' + marginPercent.toFixed(1) + '%)', cls: 'low' };
    return { text: 'Healthy margin (' + marginPercent.toFixed(1) + '%)', cls: '' };
  }

  function render() {
    var r = calculate();
    var badge = getMarginBadge(r.marginPercent);
    var profitCls = r.blendedProfitPerOrder >= 0 ? 'profit-positive' : 'profit-negative';
    var monthlyProfitCls = r.monthlyProfit >= 0 ? 'profit-positive' : 'profit-negative';

    resultSummary.innerHTML =
      '<div class="result-row"><span>Platform commission</span><span>' + formatCurrency(r.platformFee) + '</span></div>' +
      '<div class="result-row"><span>Payment gateway fee</span><span>' + formatCurrency(r.gatewayFee) + '</span></div>' +
      '<div class="result-row"><span>Profit if delivered</span><span>' + formatCurrency(r.deliveredProfit) + '</span></div>' +
      '<div class="result-row negative"><span>Loss per RTO order</span><span>-' + formatCurrency(r.rtoLoss) + '</span></div>' +
      '<div class="result-row"><span>RTO rate applied</span><span>' + r.rtoPct.toFixed(1) + '%</span></div>' +
      '<div class="result-row total ' + profitCls + '"><span>Avg. net profit / order</span><span>' + formatCurrency(r.blendedProfitPerOrder) + '</span></div>' +
      (r.orders > 0
        ? '<div class="result-row" style="margin-top: var(--space-2);"><span>Est. monthly revenue</span><span>' + formatCurrency(r.monthlyRevenue) + '</span></div>' +
          '<div class="result-row total ' + monthlyProfitCls + '"><span>Est. monthly net profit</span><span>' + formatCurrency(r.monthlyProfit) + '</span></div>'
        : '') +
      '<span class="margin-badge ' + badge.cls + '">' + badge.text + '</span>';
  }

  [sellingPrice, costPrice, forwardShipping, reverseShipping, platformFeePercent, paymentGatewayPercent, rtoRate, ordersPerMonth].forEach(function (el) {
    el.addEventListener('input', render);
  });

  render();
})();
