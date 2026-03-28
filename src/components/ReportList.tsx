import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { exportReportsToPDF, exportReportsToWord } from '../lib/export';

export default function ReportList() {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(null);
    setLoading(true);

    // Listen to legacy reports (removed orderBy to avoid index requirement)
    const q1 = query(collection(db, 'reports'), limit(100));
    const unsub1 = onSnapshot(q1, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isProfessional: false }));
      setReports(prev => {
        const others = prev.filter(r => r.isProfessional);
        const combined = [...data, ...others];
        return combined.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      });
      setLoading(false);
    }, (err) => {
      console.error("Legacy reports listener failed:", err);
      setError(`Legacy Database Error: ${err.message}`);
      setLoading(false);
    });

    // Listen to professional filled reports (removed orderBy to avoid index requirement)
    const q2 = query(collection(db, 'filled_reports'), limit(100));
    const unsub2 = onSnapshot(q2, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), isProfessional: true }));
      setReports(prev => {
        const others = prev.filter(r => !r.isProfessional);
        const combined = [...data, ...others];
        return combined.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      });
      setLoading(false);
    }, (err) => {
      console.error("Professional reports listener failed:", err);
      setError(`Professional DB Error: ${err.message}`);
      setLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-600 font-medium">Total Reports: <span className="text-zinc-900 font-bold">{reports.length}</span></p>
          {loading && <span className="text-xs text-zinc-400 animate-pulse">Syncing...</span>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportReportsToPDF(reports)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Export PDF Report</button>
          <button onClick={() => exportReportsToWord(reports)} className="bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300 transition-colors">Export Word Report</button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-mono whitespace-pre-wrap">
          ⚠️ {error}
          <p className="mt-2 text-xs opacity-75">Check your Firebase security rules and collection permissions.</p>
        </div>
      )}

      {reports.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-zinc-300 text-zinc-400">
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm">New submissions or downloads will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 border border-zinc-200 rounded-xl shadow-sm space-y-3 relative overflow-hidden flex flex-col">
              {report.isProfessional && (
                <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg uppercase tracking-tighter">
                  Professional Form
                </div>
              )}
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.reportType === 'incident' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-700'}`}>
                  {report.reportType || 'Activity'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                {report.isProfessional ? (report.eventName || 'Untitled Event') : (report.what || 'No Description')}
              </h3>

              <div className="text-sm text-zinc-600 space-y-1.5 py-2">
                <p className="flex justify-between">
                  <span className="text-zinc-400">Officer:</span>
                  <span className="font-medium text-zinc-900">{report.isProfessional ? report.officerName : report.who}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-400">Location:</span>
                  <span className="font-medium text-zinc-900">{report.isProfessional ? (report.venue || report.where) : report.where}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-400">Date:</span>
                  <span className="font-medium text-zinc-900">{report.isProfessional ? report.reportDate : (report.when ? new Date(report.when).toLocaleDateString() : 'N/A')}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 text-sm text-zinc-700 mt-auto">
                <p className="line-clamp-3 italic text-zinc-500">
                  <strong className="text-zinc-900 not-italic mr-2">Summary:</strong>
                  {report.isProfessional ? (report.dutySummary || 'No summary provided') : (report.why || 'No summary provided')}
                </p>
              </div>
              
              {report.imageUrl && (
                <img src={report.imageUrl} alt="Incident" className="mt-4 w-full h-40 object-cover rounded-lg border border-zinc-100" referrerPolicy="no-referrer" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
