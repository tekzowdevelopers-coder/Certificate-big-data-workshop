import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle, 
  Download, 
  FileText, 
  Search, 
  Star, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import CertificatePreview from './CertificatePreview';

const DEPARTMENTS = [
  'Information Science and Engineering',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other'
];

export default function StudentPortal({ onNavigateAdmin }) {
  // Navigation states: 'landing' | 'form' | 'success' | 'lookup'
  const [view, setView] = useState('landing');

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    usn: '',
    department: 'Information Science and Engineering',
    collegeName: 'RajaRajeswari College of Engineering',
    email: '',
    mobile: '',
    // Feedback Section A
    overallRating: 'Excellent',
    trainerRating: 'Excellent',
    conceptRating: 'Excellent',
    practicalRating: 'Very Good',
    academicRelevance: 'Very Relevant',
    // Feedback Section B
    learningOutcome: 'Yes, significantly',
    recommendation: 'Definitely',
    likedMost: 'Practical Sessions',
    // Feedback Section C
    suggestions: '',
  });

  // Verification modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result state
  const [submittedData, setSubmittedData] = useState(null);

  // USN Lookup state
  const [lookupUsn, setLookupUsn] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'usn' ? value.toUpperCase() : value,
    }));
    setErrorMsg('');
  };

  // Form Pre-validation
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      setErrorMsg('Please enter your full name as it should appear on the certificate.');
      return;
    }
    if (!formData.usn.trim()) {
      setErrorMsg('Please enter your valid College USN.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setShowConfirmModal(true);
  };

  // Final Submit to Backend
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        usn: formData.usn.trim().toUpperCase(),
        department: formData.department,
        collegeName: formData.collegeName,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        feedback: {
          overallRating: formData.overallRating,
          trainerRating: formData.trainerRating,
          conceptRating: formData.conceptRating,
          practicalRating: formData.practicalRating,
          academicRelevance: formData.academicRelevance,
          learningOutcome: formData.learningOutcome,
          recommendation: formData.recommendation,
          likedMost: formData.likedMost,
          suggestions: formData.suggestions,
        },
      };

      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.student) {
          // Already registered! Offer immediate download
          setSubmittedData({
            student: data.student,
            certificate: data.certificate,
            isExisting: true,
          });
          setShowConfirmModal(false);
          setView('success');
          triggerConfetti();
          return;
        }
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmittedData({
        student: data.student,
        certificate: data.certificate,
        isExisting: false,
      });

      setShowConfirmModal(false);
      setView('success');
      triggerConfetti();
    } catch (err) {
      setErrorMsg(err.message);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick USN Lookup for returning students
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupUsn.trim()) return;

    setLookupLoading(true);
    setLookupError('');

    try {
      const res = await fetch(`/api/students/check-usn/${encodeURIComponent(lookupUsn.trim())}`);
      const data = await res.json();

      if (data.isRegistered && data.student) {
        setSubmittedData({
          student: data.student,
          certificate: data.certificate,
          isExisting: true,
        });
        setView('success');
        triggerConfetti();
      } else {
        setLookupError(`No registration found for USN: ${lookupUsn.toUpperCase()}. Please complete the feedback form below.`);
      }
    } catch (err) {
      setLookupError('Failed to search record. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // -------------------------------------------------------------
  // VIEW: LANDING PAGE
  // -------------------------------------------------------------
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {/* Top Announcement Bar */}
        <div className="bg-blue-900 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm">
          <span>✨ Official Portal • Department of Information Science & Engineering & CSI Chapter of RRCE</span>
        </div>

        {/* Institution Brand Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/rrce-logo.png" alt="RRCE Crest" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  RajaRajeswari College of Engineering
                </h1>
                <p className="text-xs text-slate-600">
                  Autonomous Institution under VTU Belagavi • Mysore Road, Bengaluru
                </p>
                <p className="text-xs font-semibold text-blue-800">
                  Dept. of Information Science & Engineering • CSI Chapter & VO'ISE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <img src="/csi-logo.jpeg" alt="CSI Logo" className="h-12 w-auto object-contain rounded-full shadow-sm" />
              <img src="/tekzow-logo.jpeg" alt="Tekzow Academy Logo" className="h-10 w-auto object-contain" />
              <button
                onClick={onNavigateAdmin}
                className="ml-2 text-xs font-semibold text-slate-600 hover:text-blue-700 border border-slate-300 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Admin Login
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>30th & 31st October 2026</span>
            <span className="text-blue-300">•</span>
            <span>2-Day Technical Workshop</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl">
            NEXT GEN <span className="text-blue-700">BIG DATA & HADOOP</span> WORKSHOP
          </h1>

          {/* Presenter Information */}
          <div className="mt-4 flex items-center justify-center gap-2 text-slate-700 text-sm sm:text-base font-medium">
            <span className="text-slate-500">Presented by</span>
            <span className="font-bold text-slate-900">Mr. Sankar K</span>
            <span className="bg-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded font-semibold">
              CEO – Tekzow & Tekzow Academy
            </span>
          </div>

          {/* Welcome Message */}
          <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            Thank you for participating in our two-day technical workshop on Next Gen Big Data & Hadoop. 
            Please share your valuable feedback to automatically receive your verified personalized certificate.
          </p>

          {/* Key Workshop Highlights Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-3xl text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Hadoop & HDFS Core</h3>
                <p className="text-xs text-slate-500 mt-0.5">Distributed file systems & cluster storage architecture</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Hands-on Demos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Practical map-reduce paradigms and enterprise big data pipelines</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Official RRCE Certificate</h3>
                <p className="text-xs text-slate-500 mt-0.5">Instant PDF certificate with authorized signatures</p>
              </div>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setView('form')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-base"
            >
              <Award className="w-5 h-5" />
              <span>Submit Feedback & Get Certificate</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setView('lookup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold px-6 py-4 rounded-xl border border-slate-300 shadow-sm transition-all text-sm"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Already Submitted? Find Certificate</span>
            </button>
          </div>

          {/* Quick Notice */}
          <p className="text-xs text-slate-400 mt-6">
            Instant PDF generation • No registration account needed • Direct verification
          </p>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-4 text-center border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 RajaRajeswari College of Engineering (RRCE). All Rights Reserved.</p>
            <p>Organized in collaboration with Tekzow & Tekzow Academy, Bengaluru</p>
          </div>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: USN LOOKUP MODAL/PAGE
  // -------------------------------------------------------------
  if (view === 'lookup') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Find Your Certificate</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter your USN to retrieve and download your previously generated workshop certificate.
          </p>

          <form onSubmit={handleLookup} className="mt-6 space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                University Seat Number (USN)
              </label>
              <input
                type="text"
                placeholder="e.g. 1RR23IS001"
                value={lookupUsn}
                onChange={(e) => setLookupUsn(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base font-mono uppercase tracking-wider"
              />
            </div>

            {lookupError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={lookupLoading}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {lookupLoading ? 'Searching records...' : 'Retrieve Certificate'}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setView('landing')}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </button>
              <button
                type="button"
                onClick={() => setView('form')}
                className="text-blue-700 hover:underline font-semibold"
              >
                Submit New Feedback →
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: CERTIFICATE DOWNLOAD SUCCESS PAGE
  // -------------------------------------------------------------
  if (view === 'success' && submittedData) {
    const student = submittedData.student;
    const cert = submittedData.certificate;
    const certNumber = cert?.certificateNumber || `RRCE-BDH-2026-${student.usn}`;

    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Congratulations, {student.studentName}!
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              {submittedData.isExisting
                ? 'Your workshop record was found. Your certificate is ready for download.'
                : 'Thank you for completing the workshop feedback form. Your Certificate of Participation is generated!'}
            </p>

            {/* Quick Summary Pill Details */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 text-xs font-medium text-slate-600">
              <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                USN: <strong className="text-slate-900 font-mono">{student.usn}</strong>
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Dept: <strong className="text-slate-900">{student.department}</strong>
              </span>
              <span className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
                Cert No: <strong className="font-mono">{certNumber}</strong>
              </span>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <a
                href={`/api/certificates/${student._id}/download`}
                download={`RRCE_Workshop_Certificate_${student.usn}.pdf`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-base"
              >
                <Download className="w-5 h-5" />
                <span>Download Certificate (PDF)</span>
              </a>

              <a
                href={`/api/certificates/${student._id}/download-pptx`}
                download={`RRCE_Workshop_Certificate_${student.usn}.pptx`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-colors text-sm"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Download Original PPTX</span>
              </a>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium px-4 py-2 text-xs"
              >
                Print / Save
              </button>
            </div>
          </div>

          {/* Certificate Live Preview Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-700" />
                <span>Certificate Live Preview</span>
              </h2>
              <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full">
                Status: Official & Verified
              </span>
            </div>

            {/* Certificate Component */}
            <CertificatePreview
              studentName={student.studentName}
              usn={student.usn}
              certificateNumber={certNumber}
            />

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                Official certificate template verified by RajaRajeswari College of Engineering (RRCE), Bengaluru.
              </p>
            </div>
          </div>

          {/* Navigation link back */}
          <div className="text-center pt-2">
            <button
              onClick={() => setView('landing')}
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Workshop Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: FORM (STUDENT DETAILS + FEEDBACK)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('landing')}
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Workshop Home
          </button>
          <div className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            RRCE Workshop Feedback Portal
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <img src="/rrce-logo.png" alt="RRCE Crest" className="h-10 w-auto bg-white p-1 rounded" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Workshop Feedback & Certificate Form
              </h1>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm">
              Next Gen Big Data & Hadoop • 30th & 31st October 2026 • RRCE Bengaluru
            </p>
          </div>

          <form onSubmit={handlePreSubmit} className="p-6 sm:p-8 space-y-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                <div>
                  <h4 className="font-bold">Please check your submission</h4>
                  <p className="text-xs mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* 3.2 STUDENT INFORMATION FORM */}
            {/* -------------------------------------------------- */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-700" />
                  <span>1. Student Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your certificate will be generated using the exact Student Name and USN entered here.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="e.g. Chandana S"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Please double check spelling as it will be printed on your certificate.
                  </p>
                </div>

                {/* USN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    University Seat Number (USN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn}
                    onChange={handleInputChange}
                    placeholder="e.g. 1RR23IS015"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-mono uppercase"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* College Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@rrce.org"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* -------------------------------------------------- */}
            {/* 3.3 SECTION A – WORKSHOP EXPERIENCE */}
            {/* -------------------------------------------------- */}
            <section className="space-y-5 pt-4 border-t border-slate-200">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>2. Section A – Workshop Experience</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rate your overall experience and sessions over the two days.
                </p>
              </div>

              {/* Q1: Overall Workshop */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q1. How would you rate the overall workshop? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Excellent', 'Very Good', 'Good', 'Average', 'Poor'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, overallRating: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.overallRating === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Trainer Knowledge */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q2. How would you rate the knowledge of the trainer (Mr. Sankar K)? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Excellent', 'Very Good', 'Good', 'Average', 'Poor'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, trainerRating: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.trainerRating === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Big Data Concepts */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q3. How effective was the explanation of Big Data concepts? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Excellent', 'Very Good', 'Good', 'Average', 'Poor'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, conceptRating: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.conceptRating === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4: Practical Demo of Hadoop */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q4. How useful was the practical demonstration of Hadoop? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Excellent', 'Very Good', 'Good', 'Average', 'Poor'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, practicalRating: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.practicalRating === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Academic Relevance */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q5. Was the workshop content relevant to your academic and career development? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Very Relevant', 'Relevant', 'Neutral', 'Not Relevant'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, academicRelevance: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.academicRelevance === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* -------------------------------------------------- */}
            {/* 3.3 SECTION B – LEARNING OUTCOMES */}
            {/* -------------------------------------------------- */}
            <section className="space-y-5 pt-4 border-t border-slate-200">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>3. Section B – Learning Outcomes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tell us about your learning achievements and takeaway value.
                </p>
              </div>

              {/* Q6: Knowledge Gain */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q6. Did you gain knowledge about Big Data and Hadoop through this workshop? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Yes, significantly', 'Yes, somewhat', 'Not much'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, learningOutcome: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.learningOutcome === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q7: Recommendation */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q7. Would you recommend this workshop to other students? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Definitely', 'Maybe', 'No'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, recommendation: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all ${
                        formData.recommendation === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q8: What did you like most */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Q8. What did you like most about this workshop? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Practical Sessions',
                    'Trainer Explanation',
                    'Technical Concepts',
                    'Real-World Applications',
                    'Overall Experience',
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFormData((p) => ({ ...p, likedMost: opt }))}
                      className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border text-left transition-all ${
                        formData.likedMost === opt
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      • {opt}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* -------------------------------------------------- */}
            {/* 3.3 SECTION C – SUGGESTIONS */}
            {/* -------------------------------------------------- */}
            <section className="space-y-3 pt-4 border-t border-slate-200">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>4. Section C – Suggestions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help us make future workshops even better!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Q9. Share your suggestions or comments to improve future workshops.{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="suggestions"
                  rows={3}
                  maxLength={500}
                  value={formData.suggestions}
                  onChange={handleInputChange}
                  placeholder="Share your thoughts on topics, practical demonstrations, or pace..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                />
                <div className="text-right text-[11px] text-slate-400 mt-0.5">
                  {formData.suggestions.length}/500 characters
                </div>
              </div>
            </section>

            {/* Verification prompt callout before submit */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">
                  Please verify your details before submitting:
                </p>
                <p className="mt-0.5">
                  Your participation certificate will be generated using the student name and USN provided above.
                </p>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span>Submit Feedback & Generate Certificate</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* PRE-SUBMISSION CONFIRMATION MODAL */}
      {/* -------------------------------------------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Confirm Certificate Details</h3>
              <p className="text-xs text-slate-600 mt-1">
                Please verify your name and USN carefully. These will appear exactly on your official PDF certificate.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs uppercase font-medium">Student Name:</span>
                <span className="font-bold text-blue-950 text-base">{formData.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs uppercase font-medium">USN:</span>
                <span className="font-mono font-bold text-blue-950 text-base">{formData.usn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs uppercase font-medium">Department:</span>
                <span className="font-medium text-slate-800 text-xs">{formData.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Generating...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
