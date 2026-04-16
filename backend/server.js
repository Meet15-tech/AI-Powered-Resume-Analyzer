require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const Resume = require('./models/Resume');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resume-analyzer')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// OpenAI Configuration
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.log("OpenAI initialization avoided (No Key).");
}

app.get('/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/resumes/:id', async (req, res) => {
  try {
    const deleted = await Resume.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Resume not found' });
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });

    // 1. Parsing Resume
    const data = await pdfParse(req.file.buffer);
    const extractedText = data.text ? data.text.toString() : '';
    const textLower = extractedText.toLowerCase();

    // 2. Extracted Skills Analysis
    const coreKeywords = ["react", "node", "mongodb", "javascript", "typescript", "api", "express", "sql", "git", "html", "css"];
    let foundSkills = [];
    let missingSkills = [];
    
    coreKeywords.forEach(k => {
      if (textLower.includes(k)) foundSkills.push(k);
      else missingSkills.push(k);
    });

    // --- ATS SCORING ENGINE ---
    // Prevent NaN Helper
    const safeCalc = (val) => isNaN(val) ? 0 : val;

    // A. Keyword Match (40%)
    let kwMatchScore = (foundSkills.length / coreKeywords.length) * 40;
    
    // B. Section Completeness (20%)
    const sections = ["education", "experience", "skill", "project"];
    let foundSections = 0;
    sections.forEach(s => { if (textLower.includes(s)) foundSections++; });
    let secCompleteScore = (foundSections / sections.length) * 20;

    // C. Content Quality (20%)
    const hasMetrics = /\\d+%|\\d+x|\\$\\d+|\\d+\\+?/i.test(extractedText); // Detects 50%, 10x, $500, etc.
    const hasActionVerbs = /\\b(created|developed|led|managed|designed|engineered|achieved|optimized)\\b/i.test(extractedText);
    const hasSummary = /\\b(summary|objective|profile)\\b/i.test(extractedText);
    
    let cqScore = 0;
    if (hasMetrics) cqScore += 10;
    if (hasActionVerbs) cqScore += 10;

    // D. Skills Match for Tech Presets (20%)
    // Presets frontend/backend target
    const frontendMatch = ["react", "html", "css", "javascript"].filter(s => textLower.includes(s)).length;
    const backendMatch = ["node", "express", "mongodb", "api"].filter(s => textLower.includes(s)).length;
    
    let smScore = 0;
    if (frontendMatch >= 3 || backendMatch >= 3) smScore = 20;
    else smScore = 10;

    // Compile Final ATS Score
    let rawScore = safeCalc(kwMatchScore) + safeCalc(secCompleteScore) + safeCalc(cqScore) + safeCalc(smScore);
    let finalScore = Math.round(rawScore);
    if (finalScore > 95) finalScore = 95; // Cap at 95%
    if (finalScore < 0) finalScore = 0;

    // 3. AI Resume Feedback Generation (OpenAI or Fallback)
    let aiFeedback = [];
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an ATS Resume Analyzer. Analyze this resume text and give professional, short, actionable bullet-point suggestions to improve it for software developer roles. Return ONLY bullet points starting with exactly '- '." },
            { role: "user", content: extractedText.substring(0, 3000) } // Send a capped substring to save tokens
          ],
          temperature: 0.7,
        });
        const content = response.choices[0].message.content;
        aiFeedback = content.split('\\n').filter(l => l.trim().startsWith('-')).map(l => l.replace('- ', '').trim());
      } catch (e) {
        console.error("OpenAI API Failed: ", e.message);
        aiFeedback = ["Add measurable achievements", "Improve formatting to highlight technical impact", "Add more technical skills relevant to your target role", "Quantify results using metrics (e.g. 'improved performance by X%')"];
      }
    } else {
      // Fallback if no API key
      aiFeedback = ["Add measurable achievements", "Improve formatting to highlight technical impact", "Add more technical skills relevant to your target role", "Quantify results using metrics (e.g. 'improved performance by X%')"];
    }

    // Prepare save payload
    const resumeDoc = new Resume({
      filename: req.file.originalname,
      extractedText: extractedText.substring(0, 1500), 
      score: finalScore,
      metrics: {
        keywordMatch: safeCalc((kwMatchScore / 40) * 100),
        sectionCompleteness: safeCalc((secCompleteScore / 20) * 100),
        contentQuality: safeCalc((cqScore / 20) * 100),
        skillsMatch: safeCalc((smScore / 20) * 100)
      },
      contentIssues: {
        hasMetrics,
        hasActionVerbs,
        hasSummary
      },
      foundSkills,
      missingSkills,
      aiFeedback
    });

    const savedResume = await resumeDoc.save();

    res.status(201).json(savedResume);
  } catch (error) {
    console.error('Error uploading/analyzing resume:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
