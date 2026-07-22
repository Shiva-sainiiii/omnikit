/**
 * webhook-formatter.js
 * Formats, validates, minifies JSON, and generates mock webhook payloads.
 * Fully client-side — no network calls.
 */

(function () {
  'use strict';

  var input = document.getElementById('jsonInput');
  var output = document.getElementById('jsonOutput');
  var statusMsg = document.getElementById('statusMsg');
  var formatBtn = document.getElementById('formatBtn');
  var minifyBtn = document.getElementById('minifyBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyBtn = document.getElementById('copyBtn');
  var generateMockBtn = document.getElementById('generateMockBtn');
  var mockType = document.getElementById('mockType');

  if (!input) return; // page not loaded correctly, bail safely

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'status-msg show ' + type;
  }

  function hideStatus() {
    statusMsg.className = 'status-msg';
  }

  function parseInput() {
    var raw = input.value.trim();
    if (!raw) {
      showStatus('Paste some JSON first.', 'error');
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      showStatus('Invalid JSON: ' + err.message, 'error');
      return null;
    }
  }

  formatBtn.addEventListener('click', function () {
    var parsed = parseInput();
    if (parsed === null) return;
    output.value = JSON.stringify(parsed, null, 2);
    showStatus('Valid JSON — formatted successfully.', 'success');
  });

  minifyBtn.addEventListener('click', function () {
    var parsed = parseInput();
    if (parsed === null) return;
    output.value = JSON.stringify(parsed);
    showStatus('Valid JSON — minified.', 'success');
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    hideStatus();
  });

  copyBtn.addEventListener('click', function () {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    }).catch(function () {
      // Fallback for older browsers
      output.select();
      document.execCommand('copy');
    });
  });

  /* ------------------------------------------------------------
     Mock payload templates
     ------------------------------------------------------------ */

  var mockTemplates = {
    user_created: function () {
      return {
        event: 'user.created',
        timestamp: new Date().toISOString(),
        data: {
          id: 'usr_' + Math.random().toString(36).slice(2, 10),
          email: 'jane.doe@example.com',
          name: 'Jane Doe',
          created_at: new Date().toISOString()
        }
      };
    },
    payment_success: function () {
      return {
        event: 'payment.success',
        timestamp: new Date().toISOString(),
        data: {
          payment_id: 'pay_' + Math.random().toString(36).slice(2, 10),
          amount: 4999,
          currency: 'INR',
          status: 'captured',
          method: 'upi'
        }
      };
    },
    order_shipped: function () {
      return {
        event: 'order.shipped',
        timestamp: new Date().toISOString(),
        data: {
          order_id: 'ord_' + Math.random().toString(36).slice(2, 10),
          tracking_number: 'TRK' + Math.floor(Math.random() * 1e9),
          carrier: 'Delhivery',
          estimated_delivery: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
        }
      };
    },
    subscription_cancelled: function () {
      return {
        event: 'subscription.cancelled',
        timestamp: new Date().toISOString(),
        data: {
          subscription_id: 'sub_' + Math.random().toString(36).slice(2, 10),
          reason: 'user_requested',
          cancelled_at: new Date().toISOString(),
          refund_issued: false
        }
      };
    }
  };

  generateMockBtn.addEventListener('click', function () {
    var generator = mockTemplates[mockType.value];
    if (!generator) return;
    var payload = generator();
    input.value = JSON.stringify(payload, null, 2);
    output.value = JSON.stringify(payload, null, 2);
    showStatus('Mock payload generated: ' + mockType.value, 'success');
  });
})();
