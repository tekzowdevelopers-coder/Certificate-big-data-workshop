import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
const defaultState = {
  workshops: [
    {
      _id: 'workshop-bigdata-2026',
      workshopName: 'Next Gen Big Data & Hadoop',
      institutionName: 'RajaRajeswari College of Engineering (RRCE)',
      department: 'Information Science and Engineering',
      presenterName: 'Mr. Sankar K, CEO – Tekzow and Tekzow Academy',
      startDate: '2026-10-30',
      endDate: '2026-10-31',
      certificateTemplatePath: 'templates/Certificate RRCE (1).pptx',
      isActive: true,
      createdAt: new Date('2026-10-01').toISOString(),
    }
  ],
  admins: [
    {
      _id: 'admin-01',
      name: 'RRCE Admin',
      email: 'admin@rrce.org',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'SUPER_ADMIN',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'admin-02',
      name: 'Tekzow Admin',
      email: 'admin@tekzow.com',
      passwordHash: bcrypt.hashSync('tekzow2026', 10),
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    }
  ],
  students: [],
  feedbacks: [],
  certificates: [],
};

// Check if store file exists, if not initialize
if (!fs.existsSync(STORE_PATH)) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(defaultState, null, 2));
}

let isMongoConnected = false;

export async function initDatabase(mongoUri = process.env.MONGODB_URI) {
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      isMongoConnected = true;
      console.log(' connected successfully to MongoDB:', mongoUri);
      return { type: 'mongodb' };
    } catch (err) {
      console.warn(' MongoDB connection failed, falling back to reliable persistent JSON store:', err.message);
    }
  } else {
    // Try local mongo with fast timeout
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/rrce_workshop', {
        serverSelectionTimeoutMS: 1500,
      });
      isMongoConnected = true;
      console.log(' Connected to local MongoDB at mongodb://127.0.0.1:27017/rrce_workshop');
      return { type: 'mongodb' };
    } catch {
      console.log(' Local MongoDB daemon not detected. Using high-performance persistent JSON store at server/data/store.json.');
    }
  }
  return { type: 'json-store' };
}

// Unified Store Methods
function readStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  // WORKSHOPS
  async getActiveWorkshop() {
    const data = readStore();
    return data.workshops.find((w) => w.isActive) || data.workshops[0];
  },

  // STUDENTS
  async findStudentByUsn(workshopId, usn) {
    const data = readStore();
    const cleanUsn = usn.trim().toUpperCase();
    return data.students.find((s) => s.workshopId === workshopId && s.usn.toUpperCase() === cleanUsn) || null;
  },

  async findStudentById(id) {
    const data = readStore();
    return data.students.find((s) => s._id === id) || null;
  },

  async createStudent(studentData) {
    const data = readStore();
    const cleanUsn = studentData.usn.trim().toUpperCase();
    
    // Check duplicate
    const existing = data.students.find((s) => s.workshopId === studentData.workshopId && s.usn.toUpperCase() === cleanUsn);
    if (existing) {
      const err = new Error(`Student with USN ${cleanUsn} is already registered for this workshop.`);
      err.code = 'DUPLICATE_USN';
      throw err;
    }

    const newStudent = {
      _id: 'std_' + crypto.randomUUID().slice(0, 8),
      studentName: studentData.studentName.trim(),
      usn: cleanUsn,
      department: studentData.department,
      collegeName: studentData.collegeName || 'RajaRajeswari College of Engineering',
      email: studentData.email.trim().toLowerCase(),
      mobile: studentData.mobile ? studentData.mobile.trim() : '',
      workshopId: studentData.workshopId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.students.push(newStudent);
    writeStore(data);
    return newStudent;
  },

  async getAllStudents(workshopId) {
    const data = readStore();
    if (workshopId) {
      return data.students.filter((s) => s.workshopId === workshopId);
    }
    return data.students;
  },

  // FEEDBACK
  async createFeedback(feedbackData) {
    const data = readStore();
    
    // Check if feedback already exists for this student in this workshop
    const existing = data.feedbacks.find(
      (f) => f.workshopId === feedbackData.workshopId && f.studentId === feedbackData.studentId
    );
    if (existing) {
      const err = new Error('Feedback already submitted for this student.');
      err.code = 'DUPLICATE_FEEDBACK';
      throw err;
    }

    const newFeedback = {
      _id: 'fb_' + crypto.randomUUID().slice(0, 8),
      studentId: feedbackData.studentId,
      workshopId: feedbackData.workshopId,
      overallRating: feedbackData.overallRating,
      trainerRating: feedbackData.trainerRating,
      conceptRating: feedbackData.conceptRating,
      practicalRating: feedbackData.practicalRating,
      academicRelevance: feedbackData.academicRelevance,
      learningOutcome: feedbackData.learningOutcome,
      recommendation: feedbackData.recommendation,
      likedMost: feedbackData.likedMost,
      suggestions: feedbackData.suggestions ? feedbackData.suggestions.trim().slice(0, 500) : '',
      submittedAt: new Date().toISOString(),
    };

    data.feedbacks.push(newFeedback);
    writeStore(data);
    return newFeedback;
  },

  async getFeedbackByStudentId(studentId) {
    const data = readStore();
    return data.feedbacks.find((f) => f.studentId === studentId) || null;
  },

  async getAllFeedbacks(workshopId) {
    const data = readStore();
    if (workshopId) {
      return data.feedbacks.filter((f) => f.workshopId === workshopId);
    }
    return data.feedbacks;
  },

  // CERTIFICATES
  async getCertificateByStudentId(studentId) {
    const data = readStore();
    return data.certificates.find((c) => c.studentId === studentId) || null;
  },

  async createOrUpdateCertificate(certData) {
    const data = readStore();
    const idx = data.certificates.findIndex((c) => c.studentId === certData.studentId);
    
    if (idx >= 0) {
      data.certificates[idx] = {
        ...data.certificates[idx],
        ...certData,
        updatedAt: new Date().toISOString(),
      };
      writeStore(data);
      return data.certificates[idx];
    }

    const count = data.certificates.length + 1;
    const certNum = certData.certificateNumber || `RRCE-BDH-2026-${String(count).padStart(4, '0')}`;

    const newCert = {
      _id: 'cert_' + crypto.randomUUID().slice(0, 8),
      studentId: certData.studentId,
      workshopId: certData.workshopId,
      certificateNumber: certNum,
      fileName: certData.fileName || `RRCE_Workshop_Certificate_${certData.usn || 'STUDENT'}.pdf`,
      filePath: certData.filePath || '',
      generationStatus: certData.generationStatus || 'Generated',
      generatedAt: new Date().toISOString(),
    };

    data.certificates.push(newCert);
    writeStore(data);
    return newCert;
  },

  async getAllCertificates(workshopId) {
    const data = readStore();
    if (workshopId) {
      return data.certificates.filter((c) => c.workshopId === workshopId);
    }
    return data.certificates;
  },

  // ADMINS
  async findAdminByEmail(email) {
    const data = readStore();
    const cleanEmail = email.trim().toLowerCase();
    return data.admins.find((a) => a.email.toLowerCase() === cleanEmail) || null;
  },

  // SEED SAMPLE DATA (optional helper to preview dashboard with rich initial data)
  async seedDemoDataIfEmpty() {
    const data = readStore();
    if (data.students.length > 0) return;

    const sampleStudents = [
      {
        name: 'Arun Kumar M',
        usn: '1RR23IS004',
        dept: 'Information Science and Engineering',
        email: 'arun.k@rrce.org',
        mobile: '9845123456',
        ratings: ['Excellent', 'Excellent', 'Very Good', 'Excellent', 'Very Relevant', 'Yes, significantly', 'Definitely', 'Practical Sessions', 'Great hands-on experience with Hadoop clusters!'],
      },
      {
        name: 'Bhavana R',
        usn: '1RR23CS012',
        dept: 'Computer Science and Engineering',
        email: 'bhavana.r@rrce.org',
        mobile: '9845234567',
        ratings: ['Very Good', 'Excellent', 'Excellent', 'Very Good', 'Very Relevant', 'Yes, significantly', 'Definitely', 'Trainer Explanation', 'Mr. Sankar explained HDFS architecture very clearly.'],
      },
      {
        name: 'Chandan Gowda',
        usn: '1RR23EC021',
        dept: 'Electronics and Communication Engineering',
        email: 'chandan.g@rrce.org',
        mobile: '9845345678',
        ratings: ['Excellent', 'Very Good', 'Excellent', 'Good', 'Relevant', 'Yes, somewhat', 'Maybe', 'Technical Concepts', 'Would love more exercises on MapReduce coding.'],
      },
      {
        name: 'Divya S',
        usn: '1RR23IS028',
        dept: 'Information Science and Engineering',
        email: 'divya.s@rrce.org',
        mobile: '9845456789',
        ratings: ['Excellent', 'Excellent', 'Excellent', 'Excellent', 'Very Relevant', 'Yes, significantly', 'Definitely', 'Real-World Applications', 'Tekzow academy trainer provided real enterprise industry cases.'],
      },
      {
        name: 'Karthik N',
        usn: '1RR23ME015',
        dept: 'Mechanical Engineering',
        email: 'karthik.n@rrce.org',
        mobile: '9845567890',
        ratings: ['Good', 'Very Good', 'Good', 'Good', 'Relevant', 'Yes, somewhat', 'Definitely', 'Overall Experience', 'Informative workshop for non-CS students exploring big data.'],
      }
    ];

    const workshop = data.workshops[0];
    let count = 1;

    for (const s of sampleStudents) {
      const studentId = 'std_' + crypto.randomUUID().slice(0, 8);
      const studentObj = {
        _id: studentId,
        studentName: s.name,
        usn: s.usn,
        department: s.dept,
        collegeName: 'RajaRajeswari College of Engineering',
        email: s.email,
        mobile: s.mobile,
        workshopId: workshop._id,
        createdAt: new Date(Date.now() - (6 - count) * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - (6 - count) * 3600000).toISOString(),
      };
      data.students.push(studentObj);

      const feedbackObj = {
        _id: 'fb_' + crypto.randomUUID().slice(0, 8),
        studentId: studentId,
        workshopId: workshop._id,
        overallRating: s.ratings[0],
        trainerRating: s.ratings[1],
        conceptRating: s.ratings[2],
        practicalRating: s.ratings[3],
        academicRelevance: s.ratings[4],
        learningOutcome: s.ratings[5],
        recommendation: s.ratings[6],
        likedMost: s.ratings[7],
        suggestions: s.ratings[8],
        submittedAt: new Date(Date.now() - (6 - count) * 3600000).toISOString(),
      };
      data.feedbacks.push(feedbackObj);

      const certNum = `RRCE-BDH-2026-${String(count).padStart(4, '0')}`;
      const certObj = {
        _id: 'cert_' + crypto.randomUUID().slice(0, 8),
        studentId: studentId,
        workshopId: workshop._id,
        certificateNumber: certNum,
        fileName: `RRCE_Workshop_Certificate_${s.usn}.pdf`,
        filePath: '',
        generationStatus: 'Generated',
        generatedAt: new Date(Date.now() - (6 - count) * 3600000).toISOString(),
      };
      data.certificates.push(certObj);
      count++;
    }

    writeStore(data);
    console.log(' Demo records seeded into persistent store.');
  }
};
