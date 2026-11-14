import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectToDatabase, db } from './db.js';
import { generatePdfCertificate, generatePptxCertificate } from './certGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'rrce-bigdata-hadoop-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../templates/assets')));

// Serve production frontend if built
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Helper for JWT authentication
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

// -------------------------------------------------------------
// PUBLIC / WORKSHOP APIS
// -------------------------------------------------------------

// Active workshop info
app.get('/api/workshop', async (req, res) => {
  try {
    const workshop = await db.getActiveWorkshop();
    res.json(workshop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STUDENT & FEEDBACK COMBINED APIS (SRS Section 7 & 8)
// -------------------------------------------------------------

// Check duplicate USN
app.get('/api/students/check-usn/:usn', async (req, res) => {
  try {
    const workshop = await db.getActiveWorkshop();
    const student = await db.findStudentByUsn(workshop._id, req.params.usn);
    if (student) {
      const cert = await db.getCertificateByStudentId(student._id);
      return res.json({
        isRegistered: true,
        student: {
          _id: student._id,
          studentName: student.studentName,
          usn: student.usn,
          department: student.department,
          email: student.email,
        },
        certificate: cert,
      });
    }
    return res.json({ isRegistered: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register student AND submit feedback together (Atomic submission)
app.post('/api/students/register', async (req, res) => {
  try {
    const {
      studentName,
      usn,
      department,
      collegeName,
      email,
      mobile,
      feedback,
    } = req.body;

    // Validation
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ error: 'Student Name is required.' });
    }
    if (!usn || !usn.trim()) {
      return res.status(400).json({ error: 'USN is required.' });
    }
    if (!department) {
      return res.status(400).json({ error: 'Department is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback responses are required.' });
    }

    const workshop = await db.getActiveWorkshop();

    // Check duplicate USN
    const cleanUsn = usn.trim().toUpperCase();
    const existing = await db.findStudentByUsn(workshop._id, cleanUsn);
    if (existing) {
      const cert = await db.getCertificateByStudentId(existing._id);
      return res.status(409).json({
        error: `Student with USN ${cleanUsn} has already submitted feedback.`,
        student: existing,
        certificate: cert,
      });
    }

    // 1. Create student
    const student = await db.createStudent({
      studentName,
      usn: cleanUsn,
      department,
      collegeName: collegeName || 'RajaRajeswari College of Engineering',
      email,
      mobile,
      workshopId: workshop._id,
    });

    // 2. Create feedback
    const feedbackDoc = await db.createFeedback({
      studentId: student._id,
      workshopId: workshop._id,
      overallRating: feedback.overallRating || 'Excellent',
      trainerRating: feedback.trainerRating || 'Excellent',
      conceptRating: feedback.conceptRating || 'Very Good',
      practicalRating: feedback.practicalRating || 'Very Good',
      academicRelevance: feedback.academicRelevance || 'Very Relevant',
      learningOutcome: feedback.learningOutcome || 'Yes, significantly',
      recommendation: feedback.recommendation || 'Definitely',
      likedMost: feedback.likedMost || 'Overall Experience',
      suggestions: feedback.suggestions || '',
    });

    // 3. Generate Certificate Record
    const allCerts = await db.getAllCertificates();
    const certNum = `RRCE-BDH-2026-${String(allCerts.length + 1).padStart(4, '0')}`;
    const fileName = `RRCE_Workshop_Certificate_${cleanUsn}.pdf`;

    const certRecord = await db.createOrUpdateCertificate({
      studentId: student._id,
      workshopId: workshop._id,
      certificateNumber: certNum,
      fileName,
      generationStatus: 'Generated',
      usn: cleanUsn,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted and certificate generated successfully!',
      student,
      feedback: feedbackDoc,
      certificate: certRecord,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Retrieve student details
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await db.findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const feedback = await db.getFeedbackByStudentId(student._id);
    const certificate = await db.getCertificateByStudentId(student._id);
    res.json({ student, feedback, certificate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FEEDBACK APIS
// -------------------------------------------------------------

app.post('/api/feedback', async (req, res) => {
  try {
    const workshop = await db.getActiveWorkshop();
    const fb = await db.createFeedback({
      ...req.body,
      workshopId: workshop._id,
    });
    res.status(201).json(fb);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/feedback/:studentId', async (req, res) => {
  try {
    const fb = await db.getFeedbackByStudentId(req.params.studentId);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CERTIFICATE GENERATION & DOWNLOAD APIS
// -------------------------------------------------------------

// Get certificate metadata
app.get('/api/certificates/:studentId', async (req, res) => {
  try {
    const cert = await db.getCertificateByStudentId(req.params.studentId);
    if (!cert) return res.status(404).json({ error: 'Certificate record not found' });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download PDF Certificate
app.get('/api/certificates/:studentId/download', async (req, res) => {
  try {
    const student = await db.findStudentById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const cert = await db.getCertificateByStudentId(student._id);
    const certNumber = cert?.certificateNumber || `RRCE-BDH-2026-${student.usn}`;

    // Generate dynamic PDF
    const pdfBuffer = await generatePdfCertificate(
      student.studentName,
      student.usn,
      certNumber
    );

    const filename = `RRCE_Workshop_Certificate_${student.usn}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF download:', err);
    res.status(500).json({ error: 'Failed to generate certificate PDF: ' + err.message });
  }
});

// Download PPTX Certificate (Dynamic original PPTX)
app.get('/api/certificates/:studentId/download-pptx', async (req, res) => {
  try {
    const student = await db.findStudentById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const pptxBuffer = await generatePptxCertificate(
      student.studentName,
      student.usn
    );

    const filename = `RRCE_Workshop_Certificate_${student.usn}.pptx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pptxBuffer.length);
    res.send(pptxBuffer);
  } catch (err) {
    console.error('Error generating PPTX download:', err);
    res.status(500).json({ error: 'Failed to generate certificate PPTX: ' + err.message });
  }
});

// Inline Preview PDF
app.get('/api/certificates/:studentId/preview', async (req, res) => {
  try {
    const student = await db.findStudentById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const cert = await db.getCertificateByStudentId(student._id);
    const certNumber = cert?.certificateNumber || `RRCE-BDH-2026-${student.usn}`;

    const pdfBuffer = await generatePdfCertificate(
      student.studentName,
      student.usn,
      certNumber
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN APIS (Protected via JWT)
// -------------------------------------------------------------

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await db.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin dashboard statistics
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const students = await db.getAllStudents();
    const feedbacks = await db.getAllFeedbacks();
    const certs = await db.getAllCertificates();

    // Calculate rating stats
    const ratingWeights = {
      'Excellent': 5,
      'Very Good': 4,
      'Good': 3,
      'Average': 2,
      'Poor': 1,
    };

    let totalScore = 0;
    let scoreCount = 0;

    feedbacks.forEach((f) => {
      if (ratingWeights[f.overallRating]) {
        totalScore += ratingWeights[f.overallRating];
        scoreCount++;
      }
    });

    const averageRating = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '5.0';

    // Recent 5 submissions
    const recentSubmissions = [...students]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((s) => {
        const cert = certs.find((c) => c.studentId === s._id);
        const fb = feedbacks.find((f) => f.studentId === s._id);
        return {
          ...s,
          certificateStatus: cert ? cert.generationStatus : 'Pending',
          overallRating: fb ? fb.overallRating : 'N/A',
        };
      });

    res.json({
      totalStudents: students.length,
      totalFeedbacks: feedbacks.length,
      totalCertificates: certs.filter((c) => c.generationStatus === 'Generated').length,
      averageRating: parseFloat(averageRating),
      recentSubmissions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all student records
app.get('/api/admin/students', authenticateAdmin, async (req, res) => {
  try {
    const { search, department } = req.query;
    let students = await db.getAllStudents();
    const feedbacks = await db.getAllFeedbacks();
    const certs = await db.getAllCertificates();

    let combined = students.map((s) => {
      const fb = feedbacks.find((f) => f.studentId === s._id);
      const cert = certs.find((c) => c.studentId === s._id);
      return {
        ...s,
        feedbackSubmitted: !!fb,
        feedback: fb || null,
        certificateGenerated: cert ? cert.generationStatus : 'Pending',
        certificate: cert || null,
      };
    });

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.usn.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'All') {
      combined = combined.filter((s) => s.department === department);
    }

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback analytics
app.get('/api/admin/feedback', authenticateAdmin, async (req, res) => {
  try {
    const feedbacks = await db.getAllFeedbacks();

    // Aggregations
    const overallCounts = { Excellent: 0, 'Very Good': 0, Good: 0, Average: 0, Poor: 0 };
    const trainerCounts = { Excellent: 0, 'Very Good': 0, Good: 0, Average: 0, Poor: 0 };
    const conceptCounts = { Excellent: 0, 'Very Good': 0, Good: 0, Average: 0, Poor: 0 };
    const practicalCounts = { Excellent: 0, 'Very Good': 0, Good: 0, Average: 0, Poor: 0 };
    const relevanceCounts = { 'Very Relevant': 0, Relevant: 0, Neutral: 0, 'Not Relevant': 0 };
    const outcomeCounts = { 'Yes, significantly': 0, 'Yes, somewhat': 0, 'Not much': 0 };
    const recommendCounts = { Definitely: 0, Maybe: 0, No: 0 };
    const likedMostCounts = {};
    const suggestions = [];

    feedbacks.forEach((f) => {
      if (overallCounts[f.overallRating] !== undefined) overallCounts[f.overallRating]++;
      if (trainerCounts[f.trainerRating] !== undefined) trainerCounts[f.trainerRating]++;
      if (conceptCounts[f.conceptRating] !== undefined) conceptCounts[f.conceptRating]++;
      if (practicalCounts[f.practicalRating] !== undefined) practicalCounts[f.practicalRating]++;
      if (relevanceCounts[f.academicRelevance] !== undefined) relevanceCounts[f.academicRelevance]++;
      if (outcomeCounts[f.learningOutcome] !== undefined) outcomeCounts[f.learningOutcome]++;
      if (recommendCounts[f.recommendation] !== undefined) recommendCounts[f.recommendation]++;

      if (f.likedMost) {
        likedMostCounts[f.likedMost] = (likedMostCounts[f.likedMost] || 0) + 1;
      }
      if (f.suggestions && f.suggestions.trim()) {
        suggestions.push({
          id: f._id,
          studentId: f.studentId,
          suggestion: f.suggestions,
          submittedAt: f.submittedAt,
        });
      }
    });

    res.json({
      total: feedbacks.length,
      ratings: {
        overall: overallCounts,
        trainer: trainerCounts,
        concept: conceptCounts,
        practical: practicalCounts,
        relevance: relevanceCounts,
      },
      outcomes: outcomeCounts,
      recommendations: recommendCounts,
      likedMost: likedMostCounts,
      suggestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View individual feedback
app.get('/api/admin/feedback/:id', authenticateAdmin, async (req, res) => {
  try {
    const feedbacks = await db.getAllFeedbacks();
    const fb = feedbacks.find((f) => f._id === req.params.id || f.studentId === req.params.id);
    if (!fb) return res.status(404).json({ error: 'Feedback record not found' });
    
    const student = await db.findStudentById(fb.studentId);
    res.json({ feedback: fb, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export student data as CSV
app.get('/api/admin/export/students', authenticateAdmin, async (req, res) => {
  try {
    const students = await db.getAllStudents();
    const feedbacks = await db.getAllFeedbacks();
    const certs = await db.getAllCertificates();

    const headers = [
      'Student Name',
      'USN',
      'Department',
      'College Name',
      'Email',
      'Mobile',
      'Overall Rating',
      'Trainer Rating',
      'Concept Rating',
      'Practical Rating',
      'Academic Relevance',
      'Learning Outcome',
      'Recommend',
      'Liked Most',
      'Suggestions',
      'Certificate Number',
      'Certificate Status',
      'Registered At',
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = students.map((s) => {
      const fb = feedbacks.find((f) => f.studentId === s._id) || {};
      const cert = certs.find((c) => c.studentId === s._id) || {};
      return [
        escapeCsv(s.studentName),
        escapeCsv(s.usn),
        escapeCsv(s.department),
        escapeCsv(s.collegeName),
        escapeCsv(s.email),
        escapeCsv(s.mobile || 'N/A'),
        escapeCsv(fb.overallRating || 'N/A'),
        escapeCsv(fb.trainerRating || 'N/A'),
        escapeCsv(fb.conceptRating || 'N/A'),
        escapeCsv(fb.practicalRating || 'N/A'),
        escapeCsv(fb.academicRelevance || 'N/A'),
        escapeCsv(fb.learningOutcome || 'N/A'),
        escapeCsv(fb.recommendation || 'N/A'),
        escapeCsv(fb.likedMost || 'N/A'),
        escapeCsv(fb.suggestions || 'N/A'),
        escapeCsv(cert.certificateNumber || 'N/A'),
        escapeCsv(cert.generationStatus || 'Pending'),
        escapeCsv(new Date(s.createdAt).toLocaleString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const filename = `RRCE_BigData_Workshop_Students_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View certificate records
app.get('/api/admin/certificates', authenticateAdmin, async (req, res) => {
  try {
    const certs = await db.getAllCertificates();
    const students = await db.getAllStudents();

    const result = certs.map((c) => {
      const s = students.find((std) => std._id === c.studentId);
      return {
        ...c,
        studentName: s ? s.studentName : 'Unknown',
        usn: s ? s.usn : 'Unknown',
        department: s ? s.department : 'Unknown',
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback wildcard to index.html for SPA client routing (Express 5 compatible)
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('API endpoint not found. Please build the client or run frontend on port 5173.');
  }
});

// Initialize DB and launch server (when run locally)
async function start() {
  await connectToDatabase();
  await db.seedDemoDataIfEmpty();

  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` RRCE Feedback & Certificate Portal Backend`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api`);
    console.log(` Admin credentials: admin@rrce.org / admin123`);
    console.log(`===================================================`);
  });
}

// In Vercel serverless environment, don't start the listener
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
