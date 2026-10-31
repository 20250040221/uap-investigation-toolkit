const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  validateUapReport,
  calculateReportCompleteness,
  formatUapReport,
  hashEvidenceFile
} = require('../index.js');

test('validateUapReport accepts a complete report', () => {
  const report = {
    date: '2026-10-31',
    location: 'Riverside, CA',
    description: 'A bright object moved against the wind for several minutes and was captured on camera.',
    duration: '4 minutes',
    weather: 'Clear night sky with low haze'
  };

  const result = validateUapReport(report);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateUapReport rejects missing required fields', () => {
  const result = validateUapReport({
    date: '',
    location: '',
    description: 'Brief note'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 3);
});

test('calculateReportCompleteness returns expected percentage', () => {
  const report = {
    date: '2026-10-31',
    location: 'Austin, TX',
    description: 'A bright object was observed in the sky.',
    duration: '3 minutes',
    weather: 'partly cloudy'
  };

  assert.equal(calculateReportCompleteness(report), 100);
});

test('formatUapReport returns a readable summary object', () => {
  const report = {
    date: '2026-10-31',
    location: 'Tucson, AZ',
    description: 'Unusual light pattern',
    duration: '2 minutes',
    weather: 'Clear'
  };

  const formatted = formatUapReport(report);
  assert.equal(formatted.location, 'Tucson, AZ');
  assert.equal(formatted.summary.includes('Tucson, AZ'), true);
});

test('hashEvidenceFile returns sha256 digest for a text file', () => {
  const tempPath = path.join(__dirname, 'sample.txt');
  fs.writeFileSync(tempPath, 'evidence test data');

  try {
    const digest = hashEvidenceFile(tempPath);
    assert.equal(digest, '62c5fde3ddcaeb799937d1ddd7001eca6b4bd4a94ea4556b5e058ff339ad57c2');
  } finally {
    fs.unlinkSync(tempPath);
  }
});
