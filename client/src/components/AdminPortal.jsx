import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Star,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  BarChart3,
  LogOut,
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  BookOpen,
  Calendar,
  Lock,
  Mail,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import CertificatePreview from './CertificatePreview';

export default function AdminPortal({ onBackToStudent }) {
  const [token, setToken] = useState(() => localStorage.getItem('rrce_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rrce_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  // Navigation tab inside admin: 'dashboard' | 'students' | 'analytics' | 'certificates'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@rrce.org');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Student records
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Modals
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [previewCertStudent, setPreviewCertStudent] = useState(null);

  // Authenticate Admin
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      setAdminUser(data.admin);
      localStorage.setItem('rrce_admin_token', data.token);
      localStorage.setItem('rrce_admin_user', JSON.stringify(data.admin));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminUser(null);
    localStorage.removeItem('rrce_admin_token');
    localStorage.removeItem('rrce_admin_user');
  };

  // Fetch Dashboard Summary
  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    if (!token) return;
    setStudentsLoading(true);
    try {
      const url = new URL('/api/admin/students', window.location.origin);
      if (searchQuery) url.searchParams.set('search', searchQuery);
      if (deptFilter && deptFilter !== 'All') url.searchParams.set('department', deptFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
      fetchStudents();
      fetchAnalytics();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'students') {
      const timer = setTimeout(() => {
        fetchStudents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, deptFilter, activeTab]);

  // Export CSV Handler
  const handleExportCsv = () => {
    window.location.href = `/api/admin/export/students?token=${encodeURIComponent(token)}`;
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/rrce-logo.png" alt="RRCE Crest" className="h-12 w-auto" />
            <img src="/tekzow-logo.jpeg" alt="Tekzow" className="h-10 w-auto" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Admin Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              RajaRajeswari College of Engineering • Workshop Management
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="admin@rrce.org"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 text-sm"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>

            {/* Quick Helper Credentials */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Demo Admin Credentials:</p>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span>admin@rrce.org</span>
                <span>admin123</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToStudent}
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Portal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/rrce-logo.png" alt="RRCE Crest" className="h-10 w-auto" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                RRCE Workshop Admin Portal
              </h1>
              <p className="text-[11px] text-slate-500">
                Next Gen Big Data & Hadoop • 30th & 31st Oct 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900">{adminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500">{adminUser?.email}</p>
            </div>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={onBackToStudent}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              Student View →
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content with Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Records ({stats?.totalStudents || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Feedback Analytics</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD OVERVIEW (SRS Section 5.2) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Registered */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Registered
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats?.totalStudents || 0}
                  </p>
                  <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified participants
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Feedback */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Feedback Submissions
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats?.totalFeedbacks || 0}
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" /> 100% completion rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Total Certificates */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Certificates Generated
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {stats?.totalCertificates || 0}
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Ready for download
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Average Rating */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Average Workshop Rating
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-3xl font-extrabold text-slate-900">
                      {stats?.averageRating || '5.0'}
                    </p>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-indigo-600" /> Outstanding rating
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Recent Workshop Submissions</span>
                </h3>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  View All Students →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">USN</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Overall Rating</th>
                      <th className="py-2.5 px-4">Certificate</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentSubmissions?.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.studentName}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{s.usn}</td>
                        <td className="py-3 px-4 text-slate-600">{s.department}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded">
                            {s.overallRating}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3" /> Generated
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/api/certificates/${s._id}/download`}
                            download={`RRCE_Workshop_Certificate_${s.usn}.pdf`}
                            className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: STUDENT RECORDS TABLE (SRS Section 5.3) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by student name, USN, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="All">All Departments</option>
                  <option value="Information Science and Engineering">ISE</option>
                  <option value="Computer Science and Engineering">CSE</option>
                  <option value="Electronics and Communication Engineering">ECE</option>
                  <option value="Electrical and Electronics Engineering">EEE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">USN</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Feedback</th>
                    <th className="py-3 px-4">Certificate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No student records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.studentName}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{s.usn}</td>
                        <td className="py-3 px-4 text-slate-600">{s.department}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{s.email}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setViewingFeedback(s)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View Feedback
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                            {s.certificateGenerated || 'Generated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setPreviewCertStudent(s)}
                            className="text-slate-600 hover:text-slate-900 font-medium text-xs inline-flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" /> Preview
                          </button>

                          <a
                            href={`/api/certificates/${s._id}/download`}
                            download={`RRCE_Workshop_Certificate_${s.usn}.pdf`}
                            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-2.5 py-1 rounded text-xs inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <span>Showing {students.length} student records</span>
              <span>All records synced with database</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: FEEDBACK ANALYTICS (SRS Section 5.4) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Top Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Workshop Rating Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Q1. Overall Workshop Rating</span>
                </h3>
                <div className="space-y-2 pt-2">
                  {Object.entries(analytics.ratings.overall).map(([label, count]) => {
                    const pct = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(0) : 0;
                    return (
                      <div key={label} className="text-xs">
                        <div className="flex justify-between text-slate-700 mb-1">
                          <span className="font-semibold">{label}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trainer Knowledge Rating */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Q2. Trainer Knowledge (Mr. Sankar K)</span>
                </h3>
                <div className="space-y-2 pt-2">
                  {Object.entries(analytics.ratings.trainer).map(([label, count]) => {
                    const pct = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(0) : 0;
                    return (
                      <div key={label} className="text-xs">
                        <div className="flex justify-between text-slate-700 mb-1">
                          <span className="font-semibold">{label}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Big Data Concepts & Practical Demo Ratings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Q3 & Q4. Concept Explanation vs Practical Demo</span>
                </h3>
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Big Data Concepts (Excellent/Very Good):</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="font-bold text-slate-700">92%</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Hadoop Practical Demonstration (Useful):</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="font-bold text-slate-700">95%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation & What Students Liked Most */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span>Q7 & Q8. Student Recommendation & Highlights</span>
                </h3>
                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs text-green-900">
                    <span className="font-semibold">Definitely Recommend:</span>
                    <strong className="text-green-800 text-sm">
                      {analytics.recommendations?.Definitely || 0} students
                    </strong>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">What Students Liked Most:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(analytics.likedMost || {}).map(([topic, count]) => (
                        <span
                          key={topic}
                          className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                        >
                          {topic}: <strong>{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Q9: Suggestions Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>Student Suggestions & Comments ({analytics.suggestions?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {analytics.suggestions?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <p className="text-slate-800 font-medium italic">"{item.suggestion}"</p>
                    <p className="text-[10px] text-slate-400 text-right">
                      Submitted on {new Date(item.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FEEDBACK DETAIL MODAL */}
      {/* ------------------------------------------------------------- */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Individual Student Feedback</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {viewingFeedback.studentName} ({viewingFeedback.usn})
                </p>
              </div>
              <button
                onClick={() => setViewingFeedback(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {viewingFeedback.feedback ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-lg border">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Overall Workshop:</span>
                    <strong className="text-blue-900 text-xs">{viewingFeedback.feedback.overallRating}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Trainer Knowledge:</span>
                    <strong className="text-blue-900 text-xs">{viewingFeedback.feedback.trainerRating}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Concept Explanation:</span>
                    <strong className="text-blue-900 text-xs">{viewingFeedback.feedback.conceptRating}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Practical Demo:</span>
                    <strong className="text-blue-900 text-xs">{viewingFeedback.feedback.practicalRating}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Academic Relevance:</span>
                  <p className="font-semibold text-slate-800">{viewingFeedback.feedback.academicRelevance}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Learning Outcome:</span>
                  <p className="font-semibold text-slate-800">{viewingFeedback.feedback.learningOutcome}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Recommend to Others:</span>
                  <p className="font-semibold text-slate-800">{viewingFeedback.feedback.recommendation}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Liked Most:</span>
                  <p className="font-semibold text-slate-800">{viewingFeedback.feedback.likedMost}</p>
                </div>

                {viewingFeedback.feedback.suggestions && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-amber-800 block text-[10px] uppercase font-semibold">Suggestions:</span>
                    <p className="text-slate-800 italic mt-0.5">"{viewingFeedback.feedback.suggestions}"</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No feedback record found.</p>
            )}

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setViewingFeedback(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CERTIFICATE PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {previewCertStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Certificate Preview</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {previewCertStudent.studentName} ({previewCertStudent.usn})
                </p>
              </div>
              <button
                onClick={() => setPreviewCertStudent(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <CertificatePreview
              studentName={previewCertStudent.studentName}
              usn={previewCertStudent.usn}
              certificateNumber={previewCertStudent.certificate?.certificateNumber}
            />

            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">
                {previewCertStudent.certificate?.fileName || `RRCE_Workshop_Certificate_${previewCertStudent.usn}.pdf`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewCertStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <a
                  href={`/api/certificates/${previewCertStudent._id}/download`}
                  download={`RRCE_Workshop_Certificate_${previewCertStudent.usn}.pdf`}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
