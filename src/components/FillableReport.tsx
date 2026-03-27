import React, { useState } from 'react';
import { exportFilledReportToPDF, type FilledReportData } from '../lib/export';

const initialData: FilledReportData = {
  // Report Classification
  reportType: '', eventName: '', client: '', venue: '', reportDate: '',
  // Core Snapshot (5W1H)
  who: '', what: '', when: '', where: '', latLong: '', why: '', how: '',
  // Officer Details
  officerName: '', badgeId: '', shift: '', postZone: '', supervisor: '', contactNo: '',
  // Activity Report
  dutySummary: '',
  shiftCommencement: '',
  shiftTermination: '',
  patrolLog: [{ time: '', area: '', observations: '', action: '' }],
  crowdSize: '', crowdBehavior: '',
  equipmentStatus: '', endOfShiftRemarks: '',
  // Incident Report
  incidentRefNo: '', incidentSeverity: '', incidentDateTime: '', incidentLocation: '',
  incidentType: '', personsInvolved: '', incidentNarrative: '',
  poiActivity: '', sightingNature: '',
  evidenceCollected: '', immediateAction: '', notificationsMade: '', followUpAction: '',
  incidentRemark: '',
  // Sign-Off
  officerSignature: '', supervisorSignature: '', signOffDate: '', supervisorSignDate: '',
};

type K = keyof FilledReportData;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b-2 border-zinc-800 pb-2">
        <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', span = false, hint }: {
  label: string; name: K; value: string;
  onChange: (name: K, val: string) => void;
  type?: string; span?: boolean; hint?: string;
}) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <label className="block text-sm font-semibold text-zinc-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-zinc-400 mb-1 italic">{hint}</p>}
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(name, e.target.value)} rows={3}
          className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 resize-y" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(name, e.target.value)}
          className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900" />
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, span = false }: {
  label: string; name: K; value: string;
  onChange: (name: K, val: string) => void;
  options: string[]; span?: boolean;
}) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <label className="block text-sm font-semibold text-zinc-700 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(name, e.target.value)}
        className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white">
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function FillableReport() {
  const [data, setData] = useState<FilledReportData>({ ...initialData });
  const update = (name: K, val: string) => setData(prev => ({ ...prev, [name]: val }));

  const handleDownload = () => exportFilledReportToPDF(data);
  const handleReset = () => { if (confirm('Clear all fields?')) setData({ ...initialData }); };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Security Surveillance Report</h1>
        <div className="flex gap-3">
          <button onClick={handleReset} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">Clear All</button>
          <button onClick={handleDownload} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">Download Filled PDF</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8 space-y-10">

        {/* Report Classification */}
        <Section title="Report Classification">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Report Type" name="reportType" value={data.reportType} onChange={update} options={['Activity', 'Incident', 'Observation']} />
            <Field label="Event Name" name="eventName" value={data.eventName} onChange={update} />
            <Field label="Client / Organizer" name="client" value={data.client} onChange={update} />
            <Field label="Venue / Location" name="venue" value={data.venue} onChange={update} />
            <Field label="Date" name="reportDate" value={data.reportDate} onChange={update} type="date" />
          </div>
        </Section>

        {/* Core Snapshot (5W1H) */}
        <Section title="Core Incident Snapshot">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Who (Involved)" name="who" value={data.who} onChange={update} span />
            <Field label="What (Incident/Activity)" name="what" value={data.what} onChange={update} span />
            <Field label="When (Timestamp)" name="when" value={data.when} onChange={update} type="datetime-local" />
            <Field label="Where (Zone/Location)" name="where" value={data.where} onChange={update} />
            <Field label="Latitude / Longitude" name="latLong" value={data.latLong} onChange={update} hint="if applicable" />
            <Field label="Why (Context / Trigger)" name="why" value={data.why} onChange={update} />
            <Field label="How (Methodology / Source)" name="how" value={data.how} onChange={update} hint="Patrol / CCTV / Public Report" span />
          </div>
        </Section>

        {/* Section A: Officer Details */}
        <Section title="Section A — Officer Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Officer Name" name="officerName" value={data.officerName} onChange={update} />
            <Field label="Badge / ID No." name="badgeId" value={data.badgeId} onChange={update} />
            <Field label="Shift" name="shift" value={data.shift} onChange={update} />
            <Field label="Post / Zone Assigned" name="postZone" value={data.postZone} onChange={update} />
            <Field label="Supervisor on Duty" name="supervisor" value={data.supervisor} onChange={update} />
            <Field label="Contact No." name="contactNo" value={data.contactNo} onChange={update} />
          </div>
        </Section>

        {/* Section B: Daily Activity Report */}
        <Section title="Section B — Daily Activity Report (Monitoring Activities)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Shift Commencement" name="shiftCommencement" value={data.shiftCommencement} onChange={update} type="time" />
            <Field label="Shift Termination" name="shiftTermination" value={data.shiftTermination} onChange={update} type="time" />
          </div>
          <Field label="Duty Description / Briefing Notes" name="dutySummary" value={data.dutySummary} onChange={update} span type="textarea" />

          <div className="flex justify-between items-center mt-4 mb-2 border-b border-zinc-200 pb-1">
            <h4 className="text-sm font-bold text-zinc-700">Patrol & Activity Log</h4>
            <button 
              onClick={() => setData(prev => ({ ...prev, patrolLog: [...prev.patrolLog, { time: '', area: '', observations: '', action: '' }] }))}
              className="text-xs font-bold bg-zinc-900 text-white px-3 py-1 rounded hover:bg-zinc-800 transition-colors"
            >
              + Add Row
            </button>
          </div>
          
          <div className="space-y-4">
            {data.patrolLog.map((entry, idx) => (
              <div key={idx} className="relative grid grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                {data.patrolLog.length > 1 && (
                  <button 
                    onClick={() => setData(prev => ({ ...prev, patrolLog: prev.patrolLog.filter((_, i) => i !== idx) }))}
                    className="absolute -right-2 -top-2 bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm"
                  >
                    ×
                  </button>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Time</label>
                  <input type="text" value={entry.time} onChange={e => {
                    const newLog = [...data.patrolLog]; newLog[idx].time = e.target.value;
                    setData(prev => ({ ...prev, patrolLog: newLog }));
                  }} className="w-full p-2 border border-zinc-300 rounded text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Area / Zone</label>
                  <input type="text" value={entry.area} onChange={e => {
                    const newLog = [...data.patrolLog]; newLog[idx].area = e.target.value;
                    setData(prev => ({ ...prev, patrolLog: newLog }));
                  }} className="w-full p-2 border border-zinc-300 rounded text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Observations & Findings</label>
                  <input type="text" value={entry.observations} onChange={e => {
                    const newLog = [...data.patrolLog]; newLog[idx].observations = e.target.value;
                    setData(prev => ({ ...prev, patrolLog: newLog }));
                  }} className="w-full p-2 border border-zinc-300 rounded text-sm bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Action Taken</label>
                  <input type="text" value={entry.action} onChange={e => {
                    const newLog = [...data.patrolLog]; newLog[idx].action = e.target.value;
                    setData(prev => ({ ...prev, patrolLog: newLog }));
                  }} className="w-full p-2 border border-zinc-300 rounded text-sm bg-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <SelectField label="Estimated Crowd Size" name="crowdSize" value={data.crowdSize} onChange={update} options={['Low', 'Moderate', 'High', 'Overcapacity']} />
            <SelectField label="Crowd Behavior" name="crowdBehavior" value={data.crowdBehavior} onChange={update} options={['Calm', 'Excited', 'Agitated', 'Disruptive']} />
            <Field label="Equipment & Asset Status" name="equipmentStatus" value={data.equipmentStatus} onChange={update} span type="textarea" />
            <Field label="End of Shift Remarks" name="endOfShiftRemarks" value={data.endOfShiftRemarks} onChange={update} span type="textarea" />
          </div>
        </Section>

        {/* Section C: Incident Report */}
        <Section title="Section C — Incident Report">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Incident Reference No." name="incidentRefNo" value={data.incidentRefNo} onChange={update} />
            <SelectField label="Severity" name="incidentSeverity" value={data.incidentSeverity} onChange={update} options={['Low', 'Medium', 'High', 'Critical']} />
            <Field label="Date & Time of Report" name="incidentDateTime" value={data.incidentDateTime} onChange={update} type="datetime-local" />
            <Field label="Location / Zone" name="incidentLocation" value={data.incidentLocation} onChange={update} />
            <SelectField label="Type of Incident" name="incidentType" value={data.incidentType} onChange={update} span
              options={['Theft', 'Intrusion / Unauthorized Access', 'Assault / Altercation', 'Medical', 'Fire / Safety Hazard', 'Suspicious Activity', 'Crowd Disturbance', 'Attempted Stage/VIP Breach', 'Other']} />
            <Field label="Person of Interest (POI) / Witnesses" name="personsInvolved" value={data.personsInvolved} onChange={update} span type="textarea" />
            <Field label="Activity Spotted" name="poiActivity" value={data.poiActivity} onChange={update} span type="textarea" />
            <Field label="Incident Narrative / Description of Notice" name="incidentNarrative" value={data.incidentNarrative} onChange={update} span type="textarea" hint="Detailed, factual description" />
            <Field label="Nature of Sighting" name="sightingNature" value={data.sightingNature} onChange={update} span type="textarea" />
            <Field label="Evidence / Exhibits" name="evidenceCollected" value={data.evidenceCollected} onChange={update} span type="textarea" />
            <Field label="Immediate Action Taken" name="immediateAction" value={data.immediateAction} onChange={update} span type="textarea" />
            <Field label="Notifications Made" name="notificationsMade" value={data.notificationsMade} onChange={update} span type="textarea" hint="Police / Fire / Medical / Management — include time" />
            <Field label="Follow-Up Action Required" name="followUpAction" value={data.followUpAction} onChange={update} span type="textarea" />
            <Field label="Remark" name="incidentRemark" value={data.incidentRemark} onChange={update} span type="textarea" />
          </div>
        </Section>

        {/* Sign-Off (Staff Declaration) */}
        <Section title="Sign-Off (Staff Declaration)">
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 mb-6 font-mono text-xs">
            <p>I, <span className="font-bold underline uppercase">{data.officerName || '________________'}</span>, declare that the above information is a true representation of the activities and incidents observed during my shift on {data.reportDate || '____________'}.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <Field label="Reporting Staff Signature (Type Name)" name="officerSignature" value={data.officerSignature} onChange={update} />
              <Field label="Date / Time" name="signOffDate" value={data.signOffDate} onChange={update} type="datetime-local" />
            </div>
            <div className="space-y-4">
              <Field label="Manager Signature (Type Name)" name="supervisorSignature" value={data.supervisorSignature} onChange={update} />
              <Field label="Date / Time" name="supervisorSignDate" value={data.supervisorSignDate} onChange={update} type="datetime-local" />
            </div>
          </div>
        </Section>

      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleReset} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">Clear All</button>
        <button onClick={handleDownload} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">Download Filled PDF</button>
      </div>
    </div>
  );
}
