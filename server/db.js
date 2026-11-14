import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// MONGOOSE SCHEMAS (SRS Section 6)
// -----------------------------------------------------------------------------

const StudentSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  usn: { type: String, required: true, uppercase: true, trim: true },
  department: { type: String, required: true },
  collegeName: { type: String, default: 'RajaRajeswari College of Engineering' },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, default: '' },
  workshopId: { type: String, default: 'workshop-bigdata-2026', index: true },
}, { timestamps: true });

StudentSchema.index({ workshopId: 1, usn: 1 }, { unique: true });

const FeedbackSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  workshopId: { type: String, default: 'workshop-bigdata-2026', index: true },
  overallRating: { type: String, required: true },
  trainerRating: { type: String, required: true },
  conceptRating: { type: String, required: true },
  practicalRating: { type: String, required: true },
  academicRelevance: { type: String, required: true },
  learningOutcome: { type: String, required: true },
  recommendation: { type: String, required: true },
  likedMost: { type: String, required: true },
  suggestions: { type: String, default: '', maxlength: 500 },
  submittedAt: { type: Date, default: Date.now },
});

FeedbackSchema.index({ workshopId: 1, studentId: 1 }, { unique: true });

const CertificateSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  workshopId: { type: String, default: 'workshop-bigdata-2026', index: true },
  certificateNumber: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  filePath: { type: String, default: '' },
  generationStatus: { type: String, enum: ['Pending', 'Generated', 'Failed'], default: 'Generated' },
  generatedAt: { type: Date, default: Date.now },
});

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'ADMIN' },
  createdAt: { type: Date, default: Date.now },
});

const WorkshopSchema = new mongoose.Schema({
  _id: { type: String, default: 'workshop-bigdata-2026' },
  workshopName: { type: String, default: 'Next Gen Big Data & Hadoop' },
  institutionName: { type: String, default: 'RajaRajeswari College of Engineering (RRCE)' },
  department: { type: String, default: 'Information Science and Engineering' },
  presenterName: { type: String, default: 'Mr. Sankar K, CEO – Tekzow and Tekzow Academy' },
  startDate: { type: String, default: '2026-10-30' },
  endDate: { type: String, default: '2026-10-31' },
  certificateTemplatePath: { type: String, default: 'templates/Certificate RRCE (1).pptx' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Models (with guard against recompilation in hot reload)
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export const CertificateModel = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const WorkshopModel = mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema);

// -----------------------------------------------------------------------------
// CONNECTION CACHING FOR VERCEL SERVERLESS
// -----------------------------------------------------------------------------
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let isUsingMongo = false;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (cached.conn) {
    isUsingMongo = true;
    return cached.conn;
  }

  if (uri) {
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      }).then((m) => {
        isUsingMongo = true;
        console.log(' Connected to MongoDB Atlas / Cloud Database.');
        seedMongoDefaultIfEmpty();
        return m;
      }).catch((err) => {
        console.warn(' MongoDB Atlas connection failed, falling back:', err.message);
        cached.promise = null;
      });
    }
    cached.conn = await cached.promise;
    if (cached.conn) {
      isUsingMongo = true;
      return cached.conn;
    }
  }

  // Fallback to local MongoDB if available
  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect('mongodb://127.0.0.1:27017/rrce_workshop', {
        bufferCommands: false,
        serverSelectionTimeoutMS: 1500,
      }).then((m) => {
        isUsingMongo = true;
        seedMongoDefaultIfEmpty();
        return m;
      }).catch(() => null);
    }
    const res = await cached.promise;
    if (res) {
      cached.conn = res;
      isUsingMongo = true;
      return res;
    }
  } catch {}

  isUsingMongo = false;
  return null;
}

async function seedMongoDefaultIfEmpty() {
  try {
    const wsCount = await WorkshopModel.countDocuments();
    if (wsCount === 0) {
      await WorkshopModel.create({
        _id: 'workshop-bigdata-2026',
        workshopName: 'Next Gen Big Data & Hadoop',
        institutionName: 'RajaRajeswari College of Engineering (RRCE)',
        department: 'Information Science and Engineering',
        presenterName: 'Mr. Sankar K, CEO – Tekzow and Tekzow Academy',
        startDate: '2026-10-30',
        endDate: '2026-10-31',
        certificateTemplatePath: 'templates/Certificate RRCE (1).pptx',
        isActive: true,
      });
    }

    const adminCount = await AdminModel.countDocuments();
    if (adminCount === 0) {
      await AdminModel.create([
        {
          name: 'RRCE Admin',
          email: 'admin@rrce.org',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'SUPER_ADMIN',
        },
        {
          name: 'Tekzow Admin',
          email: 'admin@tekzow.com',
          passwordHash: bcrypt.hashSync('tekzow2026', 10),
          role: 'ADMIN',
        }
      ]);
    }
  } catch (err) {
    console.error('Mongo seed error:', err);
  }
}

// -----------------------------------------------------------------------------
// LOCAL / MEMORY JSON STORE FALLBACK
// -----------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

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

function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return defaultState;
}

function writeStore(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
  } catch {}
}

// -----------------------------------------------------------------------------
// UNIFIED DATABASE ADAPTER (Switches automatically between MongoDB & Fallback)
// -----------------------------------------------------------------------------
export const initDatabase = connectToDatabase;

export const db = {
  // WORKSHOP
  async getActiveWorkshop() {
    await connectToDatabase();
    if (isUsingMongo) {
      const w = await WorkshopModel.findOne({ isActive: true }).lean();
      if (w) return w;
      return (await WorkshopModel.findOne().lean()) || defaultState.workshops[0];
    }
    const data = readStore();
    return data.workshops.find((w) => w.isActive) || data.workshops[0];
  },

  // STUDENTS
  async findStudentByUsn(workshopId, usn) {
    await connectToDatabase();
    const cleanUsn = usn.trim().toUpperCase();
    if (isUsingMongo) {
      return await StudentModel.findOne({ workshopId, usn: cleanUsn }).lean();
    }
    const data = readStore();
    return data.students.find((s) => s.workshopId === workshopId && s.usn.toUpperCase() === cleanUsn) || null;
  },

  async findStudentById(id) {
    await connectToDatabase();
    if (isUsingMongo) {
      return await StudentModel.findById(id).lean();
    }
    const data = readStore();
    return data.students.find((s) => s._id === id || s.id === id) || null;
  },

  async createStudent(studentData) {
    await connectToDatabase();
    const cleanUsn = studentData.usn.trim().toUpperCase();

    if (isUsingMongo) {
      const existing = await StudentModel.findOne({ workshopId: studentData.workshopId, usn: cleanUsn });
      if (existing) {
        const err = new Error(`Student with USN ${cleanUsn} is already registered.`);
        err.code = 'DUPLICATE_USN';
        throw err;
      }
      const s = await StudentModel.create({
        studentName: studentData.studentName.trim(),
        usn: cleanUsn,
        department: studentData.department,
        collegeName: studentData.collegeName || 'RajaRajeswari College of Engineering',
        email: studentData.email.trim().toLowerCase(),
        mobile: studentData.mobile ? studentData.mobile.trim() : '',
        workshopId: studentData.workshopId,
      });
      return s.toObject();
    }

    const data = readStore();
    const existing = data.students.find((s) => s.workshopId === studentData.workshopId && s.usn.toUpperCase() === cleanUsn);
    if (existing) {
      const err = new Error(`Student with USN ${cleanUsn} is already registered.`);
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
    await connectToDatabase();
    if (isUsingMongo) {
      const q = workshopId ? { workshopId } : {};
      return await StudentModel.find(q).sort({ createdAt: -1 }).lean();
    }
    const data = readStore();
    if (workshopId) {
      return data.students.filter((s) => s.workshopId === workshopId);
    }
    return data.students;
  },

  // FEEDBACK
  async createFeedback(feedbackData) {
    await connectToDatabase();
    if (isUsingMongo) {
      const existing = await FeedbackModel.findOne({
        workshopId: feedbackData.workshopId,
        studentId: String(feedbackData.studentId),
      });
      if (existing) {
        const err = new Error('Feedback already submitted for this student.');
        err.code = 'DUPLICATE_FEEDBACK';
        throw err;
      }
      const fb = await FeedbackModel.create({
        studentId: String(feedbackData.studentId),
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
        submittedAt: new Date(),
      });
      return fb.toObject();
    }

    const data = readStore();
    const existing = data.feedbacks.find(
      (f) => f.workshopId === feedbackData.workshopId && String(f.studentId) === String(feedbackData.studentId)
    );
    if (existing) {
      const err = new Error('Feedback already submitted for this student.');
      err.code = 'DUPLICATE_FEEDBACK';
      throw err;
    }

    const newFeedback = {
      _id: 'fb_' + crypto.randomUUID().slice(0, 8),
      studentId: String(feedbackData.studentId),
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
    await connectToDatabase();
    if (isUsingMongo) {
      return await FeedbackModel.findOne({ studentId: String(studentId) }).lean();
    }
    const data = readStore();
    return data.feedbacks.find((f) => String(f.studentId) === String(studentId)) || null;
  },

  async getAllFeedbacks(workshopId) {
    await connectToDatabase();
    if (isUsingMongo) {
      const q = workshopId ? { workshopId } : {};
      return await FeedbackModel.find(q).lean();
    }
    const data = readStore();
    if (workshopId) {
      return data.feedbacks.filter((f) => f.workshopId === workshopId);
    }
    return data.feedbacks;
  },

  // CERTIFICATES
  async getCertificateByStudentId(studentId) {
    await connectToDatabase();
    if (isUsingMongo) {
      return await CertificateModel.findOne({ studentId: String(studentId) }).lean();
    }
    const data = readStore();
    return data.certificates.find((c) => String(c.studentId) === String(studentId)) || null;
  },

  async createOrUpdateCertificate(certData) {
    await connectToDatabase();
    const studentIdStr = String(certData.studentId);

    if (isUsingMongo) {
      const existing = await CertificateModel.findOne({ studentId: studentIdStr });
      if (existing) {
        Object.assign(existing, certData);
        await existing.save();
        return existing.toObject();
      }

      const count = await CertificateModel.countDocuments();
      const certNum = certData.certificateNumber || `RRCE-BDH-2026-${String(count + 1).padStart(4, '0')}`;
      const c = await CertificateModel.create({
        studentId: studentIdStr,
        workshopId: certData.workshopId,
        certificateNumber: certNum,
        fileName: certData.fileName || `RRCE_Workshop_Certificate_${certData.usn || 'STUDENT'}.pdf`,
        filePath: certData.filePath || '',
        generationStatus: certData.generationStatus || 'Generated',
        generatedAt: new Date(),
      });
      return c.toObject();
    }

    const data = readStore();
    const idx = data.certificates.findIndex((c) => String(c.studentId) === studentIdStr);
    
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
      studentId: studentIdStr,
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
    await connectToDatabase();
    if (isUsingMongo) {
      const q = workshopId ? { workshopId } : {};
      return await CertificateModel.find(q).lean();
    }
    const data = readStore();
    if (workshopId) {
      return data.certificates.filter((c) => c.workshopId === workshopId);
    }
    return data.certificates;
  },

  // ADMINS
  async findAdminByEmail(email) {
    await connectToDatabase();
    const cleanEmail = email.trim().toLowerCase();
    if (isUsingMongo) {
      return await AdminModel.findOne({ email: cleanEmail }).lean();
    }
    const data = readStore();
    return data.admins.find((a) => a.email.toLowerCase() === cleanEmail) || null;
  },

  async seedDemoDataIfEmpty() {
    await connectToDatabase();
    if (isUsingMongo) {
      const count = await StudentModel.countDocuments();
      if (count > 0) return;
    }
    // Same for store
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
