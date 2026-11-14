import React from 'react';

export default function CertificatePreview({ studentName, usn, certificateNumber }) {
  const certId = certificateNumber || 'RRCE-BDH-2026-PREVIEW';

  return (
    <div className="relative bg-white border-4 border-blue-900 rounded-lg p-6 shadow-2xl max-w-4xl mx-auto overflow-hidden font-serif select-none">
      {/* Inner decorative border */}
      <div className="border border-amber-600 p-6 relative bg-gradient-to-b from-amber-50/20 via-white to-blue-50/20">
        
        {/* Top Header Logos & Text */}
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* RRCE Crest */}
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <img src="/rrce-logo.png" alt="RRCE Logo" className="max-h-20 max-w-full object-contain" />
          </div>

          {/* Central Header Text */}
          <div className="text-center flex-1 px-2">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-950 uppercase tracking-tight">
              RajaRajeswari College of Engineering
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-700 font-sans italic">
              (An Autonomous Institution under Visvesvaraya Technological University, Belagavi)
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-600 font-sans">
              #14, Ramohalli Cross, Kumbalgodu, Mysore Road, Bengaluru - 560 074
            </p>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 uppercase tracking-wide">
              Department of Information Science and Engineering
            </h2>
            <div className="text-xs font-semibold text-gray-700">&</div>
            <h3 className="text-xs sm:text-sm font-bold text-blue-900">
              CSI Chapter of RRCE & “VO’ISE”
            </h3>
          </div>

          {/* Right Logos (CSI + Tekzow) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/csi-logo.jpeg" alt="CSI Logo" className="max-h-16 max-w-full object-contain rounded-full shadow-sm" />
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/tekzow-logo.jpeg" alt="Tekzow Logo" className="max-h-14 max-w-full object-contain" />
            </div>
          </div>
        </div>

        {/* Golden Separator */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-2"></div>

        {/* Certificate Title */}
        <div className="text-center my-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold italic text-blue-900 tracking-wide font-serif">
            Certificate of Participation
          </h2>
        </div>

        {/* Certificate Body Paragraph */}
        <div className="text-center my-4 px-4 space-y-2 leading-relaxed text-gray-800 font-serif">
          <p className="text-sm sm:text-base">
            This is to certify that Mr./Ms.{' '}
            <span className="font-bold text-blue-950 underline decoration-blue-800 decoration-2 underline-offset-4 px-2 text-base sm:text-lg uppercase">
              {studentName || 'STUDENT NAME'}
            </span>{' '}
            of USN:{' '}
            <span className="font-bold text-blue-950 underline decoration-blue-800 decoration-2 underline-offset-4 px-2 text-base sm:text-lg uppercase">
              {usn || '1RR23XXXXX'}
            </span>{' '}
            has attended 2 days workshop on
          </p>

          {/* Workshop Title with Apache Hadoop Element */}
          <div className="flex items-center justify-center gap-3 py-1">
            <img src="/hadoop-logo.png?v=2" alt="Apache Hadoop Element" className="h-10 sm:h-12 w-auto object-contain flex-shrink-0" />
            <span className="text-lg sm:text-2xl font-bold text-blue-900">
              “Nex - Gen Big Data & Hadoop”
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-700">
            presented by <span className="font-bold text-gray-900">Mr. Sankar K</span>,{' '}
            <span className="font-semibold text-gray-900">CEO, Tekzow and Tekzow Academy</span>, Bengaluru, on{' '}
            <span className="font-bold text-blue-950">30th & 31st Oct 2026</span>.
          </p>
        </div>

        {/* 5 DIGNITARIES / SIGNATORIES ROW (SRS Specified Order) */}
        {/* 1st Sign: Mr. Sankar K (CEO @ Tekzow) */}
        {/* 2nd Sign: Mr. Dineshkumar M (Staff Coordinator) */}
        {/* 3rd Sign: Dr. D. Sivakumar (Staff Coordinator) */}
        {/* 4th Sign: Dr. Sreenivasa Murthy V (HOD - ISE) */}
        {/* 5th Sign: Dr. R Balakrishna (Principal) */}
        <div className="mt-8 pt-4 grid grid-cols-5 items-end gap-2 text-center border-t border-gray-200">
          {/* 1. Mr. Sankar K (CEO @ Tekzow) */}
          <div className="flex flex-col items-center col-span-1">
            <div className="h-12 flex items-end justify-center mb-1">
              <img src="/sig-sankar.png?v=2" alt="Mr. Sankar K Signature" className="max-h-10 w-auto object-contain" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Mr. Sankar K</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 font-semibold whitespace-nowrap">CEO @ Tekzow</p>
          </div>

          {/* 2. Mr. Dineshkumar M (Staff Coordinator) */}
          <div className="flex flex-col items-center col-span-1">
            <div className="h-12 flex items-end justify-center mb-1">
              <img src="/sig-dinesh.png" alt="Mr. Dineshkumar M Signature" className="max-h-9 w-auto object-contain" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Mr. Dineshkumar M</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap">Staff Coordinator</p>
          </div>

          {/* 3. Dr. D. Sivakumar (Staff Coordinator) */}
          <div className="flex flex-col items-center col-span-1">
            <div className="h-12 flex items-end justify-center mb-1">
              <img src="/sig-sivakumar.png" alt="Dr. D. Sivakumar Signature" className="max-h-9 w-auto object-contain" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Dr. D. Sivakumar</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap">Staff Coordinator</p>
          </div>

          {/* 4. Dr. Sreenivasa Murthy V (HOD - ISE) */}
          <div className="flex flex-col items-center col-span-1">
            <div className="h-12 flex items-end justify-center mb-1">
              <img src="/sig-sreenivasa.png" alt="Dr. Sreenivasa Murthy V Signature" className="max-h-9 w-auto object-contain" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Dr. Sreenivasa Murthy V</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap">HOD - ISE</p>
          </div>

          {/* 5. Dr. R Balakrishna (Principal) */}
          <div className="flex flex-col items-center col-span-1">
            <div className="h-12 flex items-end justify-center mb-1">
              <img src="/sig-balakrishna.png" alt="Dr. R Balakrishna Signature" className="max-h-9 w-auto object-contain" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">Dr. R Balakrishna</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 whitespace-nowrap">Principal</p>
          </div>
        </div>

        {/* Certificate Metadata Bottom */}
        <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-sans">
          <span>Certificate ID: {certId}</span>
          <span className="text-center hidden sm:inline">RajaRajeswari College of Engineering & Tekzow Academy</span>
          <span>Verified Online</span>
        </div>
      </div>
    </div>
  );
}
