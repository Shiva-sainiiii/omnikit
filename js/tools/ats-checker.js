/**
 * ats-checker.js
 * Analyzes resume text for common ATS-compatibility issues and,
 * optionally, keyword overlap with a pasted job description.
 * All heuristic-based, fully client-side — no AI/API calls.
 */

(function () {
  'use strict';

  var resumeText = document.getElementById('resumeText');
  var jobDescText = document.getElementById('jobDescText');
  var analyzeBtn = document.getElementById('analyzeBtn');
  var clearBtn = document.getElementById('clearBtn');
  var scoreCircle = document.getElementById('scoreCircle');
  var scoreNum = document.getElementById('scoreNum');
  var checklist = document.getElementById('checklist');
  var keywordSection = document.getElementById('keywordSection');
  var missingKeywords = document.getElementById('missingKeywords');

  if (!resumeText) return;

  // Common stop words to exclude from keyword extraction
  var STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'you', 'your', 'we', 'our',
    'they', 'their', 'he', 'she', 'his', 'her', 'i', 'me', 'my', 'not',
    'no', 'so', 'if', 'than', 'then', 'about', 'into', 'through', 'per'
  ]);

  var SECTION_HEADERS = ['experience', 'education', 'skills', 'work history', 'employment', 'summary', 'projects'];
  var CONTACT_PATTERNS = {
    email: /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/,
    phone: /(\+?\d[\d\s-]{8,}\d)/
  };

  function extractKeywords(text) {
    var words = text
      .toLowerCase()
      .replace(/[^a-z0-9+.# ]/g, ' ')
      .split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOP_WORDS.has(w); });

    return new Set(words);
  }

  function checkFormatting(text) {
    var checks = [];

    // Length check
    var wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 150) {
      checks.push({ status: 'warn', text: 'Resume seems short (' + wordCount + ' words). ATS systems and recruiters typically expect enough detail to demonstrate relevant experience.' });
    } else if (wordCount > 1200) {
      checks.push({ status: 'warn', text: 'Resume is quite long (' + wordCount + ' words). Consider tightening it — most ATS-friendly resumes fit on 1-2 pages.' });
    } else {
      checks.push({ status: 'pass', text: 'Resume length looks reasonable (' + wordCount + ' words).' });
    }

    // Contact info check
    var hasEmail = CONTACT_PATTERNS.email.test(text);
    var hasPhone = CONTACT_PATTERNS.phone.test(text);
    if (hasEmail && hasPhone) {
      checks.push({ status: 'pass', text: 'Contact info detected (email and phone number found).' });
    } else {
      checks.push({ status: 'fail', text: 'Missing ' + (!hasEmail ? 'email' : '') + (!hasEmail && !hasPhone ? ' and ' : '') + (!hasPhone ? 'phone number' : '') + ' — make sure contact details are in plain text, not inside an image or text box.' });
    }

    // Section headers check
    var lowerText = text.toLowerCase();
    var foundSections = SECTION_HEADERS.filter(function (header) {
      return lowerText.includes(header);
    });
    if (foundSections.length >= 2) {
      checks.push({ status: 'pass', text: 'Standard section headers detected (' + foundSections.slice(0, 3).join(', ') + ').' });
    } else {
      checks.push({ status: 'warn', text: 'Few standard section headers found. Use clear labels like "Experience", "Education", and "Skills" so ATS software can categorize your content correctly.' });
    }

    // Bullet point usage (rough proxy: check for common bullet chars or line-start dashes)
    var hasBullets = /(^|\n)\s*[•\-\*]/.test(text);
    if (hasBullets) {
      checks.push({ status: 'pass', text: 'Bullet points detected — good for readability and ATS parsing.' });
    } else {
      checks.push({ status: 'warn', text: 'No bullet points detected. Bullet-pointed achievements tend to parse more reliably than dense paragraphs.' });
    }

    // Special character / table artifact check (common copy-paste issues from tables/columns)
    var hasTableArtifacts = /\t{2,}|\|{2,}/.test(text);
    if (hasTableArtifacts) {
      checks.push({ status: 'fail', text: 'Detected patterns that often come from tables or multi-column layouts. These frequently confuse ATS parsers — consider a single-column, simple format.' });
    } else {
      checks.push({ status: 'pass', text: 'No obvious table/column parsing artifacts detected.' });
    }

    return checks;
  }

  function calculateScore(checks, keywordMatchRatio) {
    var passWeight = 15;
    var warnWeight = 7;
    var baseScore = checks.reduce(function (sum, c) {
      if (c.status === 'pass') return sum + passWeight;
      if (c.status === 'warn') return sum + warnWeight;
      return sum;
    }, 0);

    var maxBase = checks.length * passWeight;
    var formattingScore = (baseScore / maxBase) * 70; // formatting worth 70% of total

    var keywordScore = keywordMatchRatio !== null ? keywordMatchRatio * 30 : 30; // if no JD given, give full keyword credit
    return Math.round(formattingScore + keywordScore);
  }

  function renderScore(score) {
    var cls = score >= 75 ? 'good' : (score >= 50 ? 'medium' : 'low');
    scoreCircle.className = 'score-circle ' + cls;
    scoreNum.textContent = score;
  }

  function renderChecklist(checks) {
    var iconMap = { pass: '✓', warn: '!', fail: '✕' };
    checklist.innerHTML = checks.map(function (c) {
      return '<div class="check-item ' + c.status + '"><span class="icon">' + iconMap[c.status] + '</span><span>' + escapeHtml(c.text) + '</span></div>';
    }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function analyze() {
    var resume = resumeText.value.trim();
    if (!resume) {
      scoreNum.textContent = '—';
      scoreCircle.className = 'score-circle';
      checklist.innerHTML = '<div class="check-item warn"><span class="icon">!</span><span>Paste your resume text first.</span></div>';
      keywordSection.style.display = 'none';
      return;
    }

    var checks = checkFormatting(resume);
    var jd = jobDescText.value.trim();
    var keywordMatchRatio = null;

    if (jd) {
      var resumeKeywords = extractKeywords(resume);
      var jdKeywords = Array.from(extractKeywords(jd));

      // Focus on top ~25 most relevant JD terms by frequency to avoid noise
      var freq = {};
      jd.toLowerCase().replace(/[^a-z0-9+.# ]/g, ' ').split(/\s+/).forEach(function (w) {
        if (w.length > 2 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
      });
      var topJdWords = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 25);

      var matched = topJdWords.filter(function (w) { return resumeKeywords.has(w); });
      var missing = topJdWords.filter(function (w) { return !resumeKeywords.has(w); });

      keywordMatchRatio = topJdWords.length > 0 ? matched.length / topJdWords.length : 1;

      keywordSection.style.display = 'block';
      missingKeywords.innerHTML = missing.slice(0, 15).map(function (w) {
        return '<span class="keyword-tag">' + escapeHtml(w) + '</span>';
      }).join('') || '<span class="keyword-tag matched">No major gaps found</span>';
    } else {
      keywordSection.style.display = 'none';
    }

    var score = calculateScore(checks, keywordMatchRatio);
    renderScore(score);
    renderChecklist(checks);
  }

  analyzeBtn.addEventListener('click', analyze);

  clearBtn.addEventListener('click', function () {
    resumeText.value = '';
    jobDescText.value = '';
    scoreNum.textContent = '—';
    scoreCircle.className = 'score-circle';
    checklist.innerHTML = '';
    keywordSection.style.display = 'none';
  });
})();
