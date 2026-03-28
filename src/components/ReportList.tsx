import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { exportReportsToPDF, exportReportsToWord } from '../lib/export';

export default function ReportList() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Listen to legacy reports
    const q1 = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsub1 = onSnapshot(q1, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isProfessional: false }));
      setReports(prev => {
        const others = prev.filter(r => r.isProfessional);
        return [...data, ...others].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      });
    });

    // Listen to professional filled reports
    const q2 = query(collection(db, 'filled_reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsub2 = onSnapshot(q2, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isProfessional: true }));
      setReports(prev => {
        const others = prev.filter(r => !r.isProfessional);
        return [...data, ...others].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      });
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button onClick={() => exportReportsToPDF(reports)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">Export PDF Report</button>
        <button onClick={() => exportReportsToWord(reports)} className="bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300">Export Word Report</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white p-6 border border-zinc-200 rounded-xl shadow-sm space-y-3 relative overflow-hidden">
          {report.isProfessional && (
            <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg">
              3-PAGE PDF
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${report.reportType === 'incident' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
              {report.reportType}
            </span>
            <span className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-lg text-zinc-950">{report.isProfessional ? report.eventName : report.what}</h3>
          <div className="text-sm text-zinc-600 space-y-1">
            <p><strong className="text-zinc-900">Who / Officer:</strong> {report.isProfessional ? report.officerName : report.who}</p>
            <p><strong className="text-zinc-900">Where:</strong> {report.isProfessional ? (report.venue || report.where) : report.where} {report.latitude ? `(${report.latitude}, ${report.longitude})` : ''}</p>
            <p><strong className="text-zinc-900">When:</strong> {report.isProfessional ? report.reportDate : new Date(report.when).toLocaleString()}</p>
          </div>
          <div className="pt-3 border-t border-zinc-100 text-sm text-zinc-700 space-y-2">
            <p><strong className="text-zinc-900">{report.isProfessional ? 'Duty Summary' : 'Why'}:</strong> {report.isProfessional ? report.dutySummary : report.why}</p>
          </div>
          {report.imageUrl && <img src={report.imageUrl} alt="Incident" className="mt-4 w-full h-48 object-cover rounded-lg" referrerPolicy="no-referrer" />}
        </div>
      ))}
      </div>
    </div>
  );
}
