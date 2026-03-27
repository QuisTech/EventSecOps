import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { exportReportsToPDF, exportReportsToWord } from '../lib/export';

export default function ReportList() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <button onClick={() => exportReportsToPDF(reports)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">Export PDF Report</button>
        <button onClick={() => exportReportsToWord(reports)} className="bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300">Export Word Report</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white p-6 border border-zinc-200 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${report.reportType === 'incident' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
              {report.reportType}
            </span>
            <span className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-lg text-zinc-950">{report.what}</h3>
          <div className="text-sm text-zinc-600 space-y-1">
            <p><strong className="text-zinc-900">Who:</strong> {report.who}</p>
            <p><strong className="text-zinc-900">Where:</strong> {report.where} ({report.latitude}, {report.longitude})</p>
            <p><strong className="text-zinc-900">When:</strong> {new Date(report.when).toLocaleString()}</p>
          </div>
          <div className="pt-3 border-t border-zinc-100 text-sm text-zinc-700 space-y-2">
            <p><strong className="text-zinc-900">Why:</strong> {report.why}</p>
            <p><strong className="text-zinc-900">How:</strong> {report.how}</p>
          </div>
          {report.imageUrl && <img src={report.imageUrl} alt="Incident" className="mt-4 w-full h-48 object-cover rounded-lg" referrerPolicy="no-referrer" />}
        </div>
      ))}
      </div>
    </div>
  );
}
