const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  extractedText: { type: String, required: true },
  score: { type: Number, required: true },
  
  metrics: {
    keywordMatch: { type: Number, default: 0 },
    sectionCompleteness: { type: Number, default: 0 },
    contentQuality: { type: Number, default: 0 },
    skillsMatch: { type: Number, default: 0 },
  },

  contentIssues: {
    hasMetrics: { type: Boolean, default: false },
    hasActionVerbs: { type: Boolean, default: false },
    hasSummary: { type: Boolean, default: false },
  },

  foundSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  aiFeedback: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
