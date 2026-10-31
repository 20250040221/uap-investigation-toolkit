const crypto = require('node:crypto');
const fs = require('node:fs');

const REQUIRED_FIELDS = ['date', 'location', 'description', 'duration', 'weather'];
const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
]);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeReport(report) {
  if (!report || typeof report !== 'object') {
    return {};
  }

  return {
    ...report,
    evidence: Array.isArray(report.evidence)
      ? report.evidence
      : report.evidence
        ? [report.evidence]
        : []
  };
}

function isValidDate(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function validateUapReport(report) {
  const normalized = normalizeReport(report);
  const errors = [];
  const warnings = [];
  const missingFields = [];

  for (const field of REQUIRED_FIELDS) {
    if (!isNonEmptyString(normalized[field])) {
      missingFields.push(field);
      errors.push(`Missing required field: ${field}.`);
    }
  }

  if (normalized.date && !isValidDate(normalized.date)) {
    errors.push('Date is not a valid date value.');
  }

  if (normalized.location && normalized.location.trim().length < 2) {
    errors.push('Location must be at least 2 characters long.');
  }

  if (normalized.description && normalized.description.trim().length < 20) {
    warnings.push('Description is brief; more narrative detail will strengthen the report.');
  }

  if (normalized.duration && !String(normalized.duration).trim().match(/\d/)) {
    warnings.push('Duration should include a measurable time value.');
  }

  if (normalized.weather && normalized.weather.trim().length < 2) {
    warnings.push('Weather field may be too brief to be useful for review.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingFields
  };
}

function calculateReportCompleteness(report) {
  const normalized = normalizeReport(report);
  let completed = 0;

  for (const field of REQUIRED_FIELDS) {
    if (isNonEmptyString(normalized[field])) {
      completed += 1;
    }
  }

  return Math.round((completed / REQUIRED_FIELDS.length) * 100);
}

function formatUapReport(report) {
  const normalized = normalizeReport(report);
  const validation = validateUapReport(normalized);

  const summary = [
    `Date: ${normalized.date || 'Not provided'}`,
    `Location: ${normalized.location || 'Unknown'}`,
    `Duration: ${normalized.duration || 'Not provided'}`,
    `Weather: ${normalized.weather || 'Not provided'}`,
    `Description: ${normalized.description || 'No description provided'}`
  ].join(' | ');

  return {
    date: normalized.date || 'Not provided',
    location: normalized.location || 'Unknown',
    duration: normalized.duration || 'Not provided',
    weather: normalized.weather || 'Not provided',
    description: normalized.description || 'No description provided',
    evidenceCount: normalized.evidence.length,
    summary,
    status: validation.valid ? 'Ready for review' : 'Needs additional information'
  };
}

function hashEvidenceFile(filePath) {
  if (!isNonEmptyString(filePath)) {
    throw new Error('A valid file path is required to hash evidence.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Evidence file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function validateEvidenceFile(file, options = {}) {
  if (!file) {
    throw new Error('No evidence file was provided.');
  }

  const maxSize = options.maxSizeBytes ?? 25 * 1024 * 1024;
  const allowedMimeTypes = options.allowedMimeTypes ?? ALLOWED_EVIDENCE_MIME_TYPES;

  if (typeof file.size === 'number' && file.size > maxSize) {
    throw new Error(`File exceeds the maximum upload size of ${maxSize} bytes.`);
  }

  if (file.mimetype && !allowedMimeTypes.has(file.mimetype)) {
    throw new Error('Unsupported file type. Please upload JPG, PNG, GIF, MP4, MOV, AVI, or WebM files only.');
  }

  return {
    valid: true,
    size: typeof file.size === 'number' ? file.size : 0,
    mimeType: file.mimetype || 'unknown'
  };
}

module.exports = {
  REQUIRED_FIELDS,
  ALLOWED_EVIDENCE_MIME_TYPES,
  validateUapReport,
  calculateReportCompleteness,
  formatUapReport,
  hashEvidenceFile,
  validateEvidenceFile,
  validateSighting: validateUapReport,
  calculateCompleteness: calculateReportCompleteness,
  formatSighting: formatUapReport,
  calculateEvidenceHash: hashEvidenceFile
};
