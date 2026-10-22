const fs = require('fs');

// Copy engine.js
let engine = fs.readFileSync('src/js/engine.js', 'utf8');
const engineExport = '\nexport {\n  DAY, N, I, TD, fmt, okD, vp, badP, pEnd, pdset,\n  calculateStats, calculatePregnancy, checkCareAlerts,\n  getDailyPhaseGuidance, generateClinicianSummary, compareToUsual,\n  CERVICAL_FLUID, calculatePeriodDurations, calculateVariability,\n  aggregateSymptoms, aggregateMoods\n};\n';
if (!engine.includes('export {')) engine += engineExport;
fs.writeFileSync('src/core/engine.js', engine);

// Copy storage.js
let storage = fs.readFileSync('src/js/storage.js', 'utf8');
const storageExport = '\nexport {\n  KEY, SCHEMA_VERSION, DEFAULT_CARE_KIT, defState, migrateState, loadState, saveState,\n  getPrivacyLedger, hashPin, verifyPin, PinLock, generateCSV, generateJSON,\n  previewImport, CycleStorage\n};\n';
if (!storage.includes('export {')) storage += storageExport;
fs.writeFileSync('src/core/storage.js', storage);

// Copy content.js
let content = fs.readFileSync('src/js/content.js', 'utf8');
const contentExport = '\nexport {\n  ARTICLES, searchArticles, getArticlesByTag, getRecommendedArticles,\n  REASSURANCE_MESSAGES, getReassuranceMessage, FULL_CYCLE_CARE_GUIDES,\n  CYCLE_EXPLAINED_CARDS, getCareSuggestions\n};\n';
if (!content.includes('export {')) content += contentExport;
fs.writeFileSync('src/core/content.js', content);

// Copy assistant.js
let assistant = fs.readFileSync('src/js/assistant.js', 'utf8');
const assistantExport = '\nexport { ASSISTANT_TOPICS, answerQuestion };\n';
if (!assistant.includes('export {')) assistant += assistantExport;
fs.writeFileSync('src/core/assistant.js', assistant);

console.log('Successfully copied all 4 core files to src/core/ with ES exports added!');
