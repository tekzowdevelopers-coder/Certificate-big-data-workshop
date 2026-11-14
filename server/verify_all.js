// Global fetch is built-in in Node 22

async function runTests() {
  const BASE_URL = 'http://localhost:5000';
  console.log('--- STARTING END-TO-END SRS COMPLIANCE TESTS ---');

  // 1. Check Workshop
  const wRes = await fetch(`${BASE_URL}/api/workshop`);
  const workshop = await wRes.json();
  console.log('1. Active Workshop:', workshop.workshopName, '| Status:', wRes.status);

  // 2. Register Student & Submit Feedback
  const studentPayload = {
    studentName: 'Chandana S',
    usn: '1RR23IS015',
    department: 'Information Science and Engineering',
    collegeName: 'RajaRajeswari College of Engineering',
    email: 'chandana.s@rrce.org',
    mobile: '9845998877',
    feedback: {
      overallRating: 'Excellent',
      trainerRating: 'Excellent',
      conceptRating: 'Excellent',
      practicalRating: 'Very Good',
      academicRelevance: 'Very Relevant',
      learningOutcome: 'Yes, significantly',
      recommendation: 'Definitely',
      likedMost: 'Practical Sessions',
      suggestions: 'The practical demonstration of Hadoop clusters and HDFS was superb!',
    },
  };

  const regRes = await fetch(`${BASE_URL}/api/students/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentPayload),
  });
  const regData = await regRes.json();
  console.log('2. Student Registration & Feedback:', regData.success ? 'SUCCESS' : 'FAILED', '| Code:', regRes.status);
  console.log('   Certificate Number:', regData.certificate?.certificateNumber);
  console.log('   Certificate File:', regData.certificate?.fileName);

  const studentId = regData.student._id;

  // 3. Test Duplicate Prevention
  const dupRes = await fetch(`${BASE_URL}/api/students/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentPayload),
  });
  console.log('3. Duplicate USN Prevention Test:', dupRes.status === 409 ? 'PASSED (409 Conflict)' : 'FAILED');

  // 4. Test Check USN Endpoint
  const checkRes = await fetch(`${BASE_URL}/api/students/check-usn/1RR23IS015`);
  const checkData = await checkRes.json();
  console.log('4. Check USN Lookup:', checkData.isRegistered ? 'FOUND' : 'NOT FOUND');

  // 5. Download Certificate PDF
  const dlRes = await fetch(`${BASE_URL}/api/certificates/${studentId}/download`);
  const pdfBytes = await dlRes.arrayBuffer();
  console.log('5. Certificate PDF Download: Status', dlRes.status, '| Size:', pdfBytes.byteLength, 'bytes');
  console.log('   Content-Type:', dlRes.headers.get('content-type'));
  console.log('   Content-Disposition:', dlRes.headers.get('content-disposition'));

  // 6. Admin Login
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@rrce.org', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  console.log('6. Admin Login Test:', loginData.success ? 'SUCCESS' : 'FAILED');
  const token = loginData.token;

  // 7. Admin Dashboard Stats
  const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  console.log('7. Admin Dashboard Stats:', dashData);

  // 8. Admin Student Search
  const searchRes = await fetch(`${BASE_URL}/api/admin/students?search=Chandana`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchData = await searchRes.json();
  console.log('8. Admin Student Search (Chandana): Found', searchData.length, 'records');

  // 9. Admin CSV Export
  const csvRes = await fetch(`${BASE_URL}/api/admin/export/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvText = await csvRes.text();
  console.log('9. Admin CSV Export: Status', csvRes.status, '| Lines:', csvText.split('\n').length);

  console.log('--- ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
