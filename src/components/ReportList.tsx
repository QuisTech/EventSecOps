import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { exportReportsToPDF, exportReportsToWord } from '../lib/export';

export default function ReportList() {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);

    // Listen to legacy reports
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

    // Listen to professional filled reports
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-600 font-medium">Total Reports: <span className="text-zinc-900 font-bold">{reports.length}</span></p>
          {loading && <span className="text-xs text-zinc-400 animate-pulse">Syncing...</span>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportReportsToPDF(reports)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Export All PDF</button>
          <button onClick={() => exportReportsToWord(reports)} className="bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300 transition-colors">Export All Word</button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-mono whitespace-pre-wrap">
          ⚠️ {error}
          <p className="mt-2 text-xs opacity-75 text-red-600">Permissions issue? Make sure rules are published in Firebase Console.</p>
        </div>
      )}

      {reports.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-zinc-300 text-zinc-400">
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm">Reports appear here automatically when downloaded or submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="group bg-white p-6 border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col"
                 onClick={() => setSelectedReport(report)}>
              {report.isProfessional && (
                <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] px-3 py-1 font-bold rounded-bl-lg uppercase tracking-wider">
                  Professional
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${report.reportType === 'incident' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-zinc-50 text-zinc-600 border border-zinc-100'}`}>
                  {report.reportType || 'Activity'}
                </span>
                <span className="text-[10px] font-medium text-zinc-400">
                  {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-2 group-hover:text-zinc-600 transition-colors">
                {report.isProfessional ? (report.eventName || 'Untitled Event') : (report.what || 'No Description')}
              </h3>

              <div className="text-[13px] text-zinc-600 space-y-2 flex-grow">
                <div className="flex justify-between border-b border-zinc-50 pb-1">
                  <span className="text-zinc-400">Officer</span>
                  <span className="font-semibold text-zinc-800">{report.isProfessional ? report.officerName : report.who}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1">
                  <span className="text-zinc-400">Venue</span>
                  <span className="font-semibold text-zinc-800">{report.isProfessional ? (report.venue || report.where) : report.where}</span>
                </div>
                {report.isProfessional && (
                  <div className="flex justify-between border-b border-zinc-50 pb-1">
                    <span className="text-zinc-400">Post/Zone</span>
                    <span className="font-semibold text-zinc-800">{report.postZone || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 italic text-[12px] text-zinc-500 line-clamp-2">
                {report.isProfessional ? (report.dutySummary || 'Professional surveillance submission.') : report.why}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedReport(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-zinc-900 p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-700 px-2 py-0.5 rounded text-zinc-300 mb-2 inline-block">
                  {selectedReport.isProfessional ? '3-Page Professional Form' : 'Standard Submission'}
                </span>
                <h2 className="text-xl font-bold">{selectedReport.isProfessional ? selectedReport.eventName : selectedReport.what}</h2>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
                title="ESC to close"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {[
                  { label: 'Officer', value: selectedReport.isProfessional ? selectedReport.officerName : selectedReport.who },
                  { label: 'Badge / ID', value: selectedReport.badgeId || 'N/A' },
                  { label: 'Location / Venue', value: selectedReport.isProfessional ? selectedReport.venue : selectedReport.where },
                  { label: 'Date', value: selectedReport.isProfessional ? selectedReport.reportDate : selectedReport.when },
                ].map(item => (
                  <div key={item.label} className="border-b border-zinc-100 pb-2">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">{item.label}</label>
                    <div className="text-sm font-semibold text-zinc-900">{item.value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Extended Content */}
              <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
                <section className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Narrative / Summary</h4>
                  <p>{selectedReport.isProfessional ? selectedReport.dutySummary : selectedReport.why}</p>
                </section>

                {selectedReport.isProfessional && (
                  <>
                    <section className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold text-zinc-400">Patrol Log Snippet</h4>
                      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden text-xs">
                        <table className="w-full">
                          <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                              <th className="px-3 py-2 text-left">Time</th>
                              <th className="px-3 py-2 text-left">Area</th>
                              <th className="px-3 py-2 text-left">Observation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {selectedReport.patrolLog?.slice(0, 5).map((log: any, i: number) => (
                              <tr key={i}>
                                <td className="px-3 py-2">{log.time}</td>
                                <td className="px-3 py-2">{log.area}</td>
                                <td className="px-3 py-2">{log.observations}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                       <div className="bg-zinc-50 p-3 rounded-lg">
                         <label className="text-[10px] font-bold text-zinc-400 block mb-1">CROWD SIZE</label>
                         <span className="font-bold text-zinc-900">{selectedReport.crowdSize || '—'}</span>
                       </div>
                       <div className="bg-zinc-50 p-3 rounded-lg">
                         <label className="text-[10px] font-bold text-zinc-400 block mb-1">CROWD BEHAVIOR</label>
                         <span className="font-bold text-zinc-900">{selectedReport.crowdBehavior || '—'}</span>
                       </div>
                    </section>
                  </>
                )}

                {selectedReport.imageUrl && (
                  <img src={selectedReport.imageUrl} alt="Attached Evidence" className="w-full rounded-xl border border-zinc-200 shadow-sm" />
                )}
              </div>
            </div>
            
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-400 font-medium">
              <span>Report ID: {selectedReport.id}</span>
              <span>Saved on: {new Date(selectedReport.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
