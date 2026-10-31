const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const toolkit = require('./index.js');

const {
  validateUapReport,
  calculateReportCompleteness,
  formatUapReport,
  hashEvidenceFile,
  validateEvidenceFile
} = toolkit;

test('validateUapReport accepts a complete report', () => {
  const report = {
    date: '2026-10-31',
    location: 'Riverside, CA',
    description: 'A bright object moved across the sky for several minutes before fading from view.',
    duration: '4 minutes',
    weather: 'Clear sky with low haze'
  };

  const result = validateUapReport(report);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateUapReport rejects missing required fields', () => {
  const result = validateUapReport({
    date: '',
    location: '',
    description: 'brief note'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 3);
  assert.ok(result.missingFields.includes('date'));
});

test('calculateReportCompleteness returns 100 for a complete report', () => {
  const report = {
    date: '2026-10-31',
    location: 'Austin, TX',
    description: 'A bright light moved steadily across the night sky.',
    duration: '3 minutes',
    weather: 'partly cloudy'
  };

  assert.equal(calculateReportCompleteness(report), 100);
});

test('formatUapReport returns a readable summary', () => {
  const report = {
    date: '2026-10-31',
    location: 'Tucson, AZ',
    description: 'Unusual light pattern observed for two minutes.',
    duration: '2 minutes',
    weather: 'Clear'
  };

  const formatted = formatUapReport(report);
  assert.equal(formatted.location, 'Tucson, AZ');
  assert.equal(formatted.summary.includes('Tucson, AZ'), true);
  assert.equal(formatted.status, 'Ready for review');
});

test('hashEvidenceFile returns the expected SHA-256 value', () => {
  const tempPath = path.join(__dirname, 'sample-evidence.txt');
  fs.writeFileSync(tempPath, 'evidence test data');

  try {
    const digest = hashEvidenceFile(tempPath);
    assert.equal(digest, '62c5fde3ddcaeb799937d1ddd7001eca6b4bd4a94ea4556b5e058ff339ad57c2');
  } finally {
    fs.unlinkSync(tempPath);
  }
});

test('validateEvidenceFile accepts supported files and rejects oversized or invalid files', () => {
  const valid = validateEvidenceFile({
    size: 1200,
    mimetype: 'image/png'
  }, {
    maxSizeBytes: 5000,
    allowedMimeTypes: new Set(['image/png'])
  });

  assert.equal(valid.valid, true);

  assert.throws(() => {
    validateEvidenceFile({ size: 99999, mimetype: 'image/png' }, {
      maxSizeBytes: 100,
      allowedMimeTypes: new Set(['image/png'])
    });
  }, /maximum upload size/i);

  assert.throws(() => {
    validateEvidenceFile({ size: 100, mimetype: 'application/pdf' }, {
      maxSizeBytes: 5000,
      allowedMimeTypes: new Set(['image/png'])
    });
  }, /Unsupported file type/i);
});
