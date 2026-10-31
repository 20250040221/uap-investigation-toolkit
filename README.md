# UAP Investigation Toolkit

A reusable JavaScript package for validating UAP sighting reports and checking evidence integrity.

## Features

- Report validation for required fields
- Completeness score calculation
- Human-readable report formatting
- SHA-256 evidence hashing
- Clear error handling for invalid input

## Installation

```bash
npm install uap-investigation-toolkit
```

## Usage

```js
const {
  validateUapReport,
  calculateReportCompleteness,
  formatUapReport,
  hashEvidenceFile
} = require('uap-investigation-toolkit');

const report = {
  date: '2026-10-31',
  location: 'Riverside, CA',
  description: 'A bright object moved across the sky for several minutes before fading.',
  duration: '4 minutes',
  weather: 'Clear night sky with light haze'
};

const validation = validateUapReport(report);
const completeness = calculateReportCompleteness(report);
const formatted = formatUapReport(report);
const hash = hashEvidenceFile('./uploads/video.mp4');

console.log(validation);
console.log(completeness);
console.log(formatted.summary);
console.log(hash);
```

## Notes

This package is designed to validate incident reports and evidence-file integrity. It does not claim to scientifically determine the nature or origin of an object.

## License

MIT
