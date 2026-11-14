import React, { useState } from 'react';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [currentPage, setCurrentPage] = useState('student'); // 'student' | 'admin'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {currentPage === 'student' ? (
        <StudentPortal onNavigateAdmin={() => setCurrentPage('admin')} />
      ) : (
        <AdminPortal onBackToStudent={() => setCurrentPage('student')} />
      )}
    </div>
  );
}
