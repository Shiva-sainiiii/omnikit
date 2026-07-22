/**
 * prompt-optimizer.js
 * Converts a plain-language instruction into a structured system prompt.
 * Pure template logic — no API calls, fully client-side.
 */

(function () {
  'use strict';

  var simpleInput = document.getElementById('simpleInput');
  var promptOutput = document.getElementById('promptOutput');
  var optimizeBtn = document.getElementById('optimizeBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyBtn = document.getElementById('copyBtn');
  var targetModel = document.getElementById('targetModel');
  var tone = document.getElementById('tone');
  var outputFormat = document.getElementById('outputFormat');

  if (!simpleInput) return;

  var toneDescriptions = {
    neutral: 'Maintain a professional, neutral tone throughout your responses.',
    friendly: 'Use a warm, conversational, approachable tone — like a knowledgeable friend, not a corporate manual.',
    strict: 'Be precise and direct. Avoid hedging language, filler, or unnecessary elaboration.'
  };

  var formatDescriptions = {
    unspecified: null,
    markdown: 'Format your response using Markdown (headers, bullet points, code blocks where relevant).',
    json: 'Respond only with valid JSON. Do not include any explanatory text outside the JSON object.',
    bullets: 'Structure your response primarily as bullet points for scannability.',
    plain: 'Respond in plain text only — no Markdown formatting, no special characters for emphasis.'
  };

  function extractTask(raw) {
    // Light cleanup: trim, ensure it reads like a task description
    return raw.trim().replace(/\s+/g, ' ');
  }

  function guessRole(task) {
    var lower = task.toLowerCase();
    if (lower.includes('code') || lower.includes('debug') || lower.includes('function') || lower.includes('script')) {
      return 'an expert software engineer';
    }
    if (lower.includes('write') || lower.includes('blog') || lower.includes('article') || lower.includes('content') || lower.includes('caption') || lower.includes('description')) {
      return 'a skilled copywriter and content strategist';
    }
    if (lower.includes('email') || lower.includes('message') || lower.includes('reply')) {
      return 'a professional communications assistant';
    }
    if (lower.includes('data') || lower.includes('analyze') || lower.includes('analysis') || lower.includes('report')) {
      return 'a meticulous data analyst';
    }
    if (lower.includes('resume') || lower.includes('cv') || lower.includes('cover letter')) {
      return 'an experienced career coach and resume writer';
    }
    return 'a highly capable domain expert';
  }

  function buildForClaude(task, role, toneText, formatText) {
    var xml = '<role>\nYou are ' + role + '.\n</role>\n\n';
    xml += '<task>\n' + task + '\n</task>\n\n';
    xml += '<tone>\n' + toneText + '\n</tone>\n\n';
    if (formatText) {
      xml += '<output_format>\n' + formatText + '\n</output_format>\n\n';
    }
    xml += '<constraints>\n- Ask a clarifying question only if the request is genuinely ambiguous.\n- Prioritize accuracy over speculation.\n</constraints>';
    return xml;
  }

  function buildForChatGPT(task, role, toneText, formatText) {
    var md = '## Role\nYou are ' + role + '.\n\n';
    md += '## Task\n' + task + '\n\n';
    md += '## Tone\n' + toneText + '\n\n';
    if (formatText) {
      md += '## Output Format\n' + formatText + '\n\n';
    }
    md += '## Constraints\n- Stay focused on the task above.\n- If information is missing, make a reasonable assumption and state it briefly rather than stalling.';
    return md;
  }

  function buildForGemini(task, role, toneText, formatText) {
    var text = 'ROLE: You are ' + role + '.\n\n';
    text += 'TASK: ' + task + '\n\n';
    text += 'TONE: ' + toneText + '\n\n';
    if (formatText) {
      text += 'OUTPUT FORMAT: ' + formatText + '\n\n';
    }
    text += 'GUIDELINES:\n- Be thorough but avoid unnecessary repetition.\n- Ground responses in the specifics of the task above.';
    return text;
  }

  function buildGeneral(task, role, toneText, formatText) {
    var text = 'You are ' + role + '.\n\n';
    text += 'Your task: ' + task + '\n\n';
    text += toneText + '\n\n';
    if (formatText) {
      text += formatText + '\n\n';
    }
    text += 'If any part of this request is ambiguous, make a reasonable assumption and proceed rather than stopping to ask.';
    return text;
  }

  optimizeBtn.addEventListener('click', function () {
    var raw = simpleInput.value;
    if (!raw || !raw.trim()) {
      promptOutput.value = 'Type an instruction first — e.g. "Summarize long articles into 3 bullet points."';
      return;
    }

    var task = extractTask(raw);
    var role = guessRole(task);
    var toneText = toneDescriptions[tone.value] || toneDescriptions.neutral;
    var formatText = formatDescriptions[outputFormat.value];

    var result;
    switch (targetModel.value) {
      case 'claude':
        result = buildForClaude(task, role, toneText, formatText);
        break;
      case 'chatgpt':
        result = buildForChatGPT(task, role, toneText, formatText);
        break;
      case 'gemini':
        result = buildForGemini(task, role, toneText, formatText);
        break;
      default:
        result = buildGeneral(task, role, toneText, formatText);
    }

    promptOutput.value = result;
  });

  clearBtn.addEventListener('click', function () {
    simpleInput.value = '';
    promptOutput.value = '';
  });

  copyBtn.addEventListener('click', function () {
    if (!promptOutput.value) return;
    navigator.clipboard.writeText(promptOutput.value).then(function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1500);
    }).catch(function () {
      promptOutput.select();
      document.execCommand('copy');
    });
  });
})();
