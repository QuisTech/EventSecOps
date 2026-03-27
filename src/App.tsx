/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { scheduleData } from './data';
import { exportToPDF, exportToWord, exportReportsToWord } from './lib/export';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import FillableReport from './components/FillableReport';
import SignInButton from './components/SignInButton';
import { Calendar, FileText, ClipboardList, FileEdit } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'schedule' | 'submit' | 'fill' | 'review'>('fill');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'admin') {
      setIsAdmin(true);
      setView('schedule');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setIsAdmin(prev => {
          const next = !prev;
          if (!next && (view === 'schedule' || view === 'submit' || view === 'review')) setView('fill');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const navItems = [
    { id: 'schedule', label: 'Schedule', icon: Calendar, adminOnly: true },
    { id: 'submit', label: 'Submit Report', icon: FileText, adminOnly: true },
    { id: 'fill', label: 'Fill Report', icon: FileEdit },
    { id: 'review', label: 'Review Reports', icon: ClipboardList, adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <aside className="w-64 border-r border-zinc-200 bg-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8 text-zinc-950">Surveillance Ops</h2>
          <nav className="space-y-2">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id as 'schedule' | 'submit' | 'fill' | 'review')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${view === item.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <SignInButton />
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {view === 'schedule' && isAdmin && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Staff Schedule</h1>
                <div className="space-x-3">
                  <button onClick={exportToPDF} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">Export PDF</button>
                  <button onClick={exportToWord} className="bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300">Export Word</button>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      {['Date', 'Shift', 'Location', 'Manager', 'Staff'].map(h => <th key={h} className="p-4 text-left font-semibold text-zinc-600">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {scheduleData.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="p-4 font-medium">{row.date}</td>
                        <td className="p-4">{row.shift}</td>
                        <td className="p-4">{row.location}</td>
                        <td className="p-4">{row.manager}</td>
                        <td className="p-4 text-zinc-600">{row.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {view === 'submit' && (
              <ReportForm />
          )}
          {view === 'fill' && (
              <FillableReport />
          )}
          {view === 'review' && (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-8">Review Surveillance Reports</h1>
              <ReportList />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
