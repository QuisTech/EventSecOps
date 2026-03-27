import React, { useState } from 'react';
import { exportFilledReportToPDF, type FilledReportData } from '../lib/export';

const initialData: FilledReportData = {
  // Report Classification
  reportType: '', eventName: '', client: '', venue: '', reportDate: '',
  // Core Incident Snapshot
  who: '', what: '', when: '', where: '', latLong: '', why: '', how: '',
  // Officer Details
  officerName: '', badgeId: '', shift: '', postZone: '', supervisor: '', contactNo: '',
  // Event & Crowd Overview
  crowdSize: '', crowdBehavior: '', protesters: '', riskLevel: '',
  // Daily Activity Report
  dutySummary: '',
  patrolTime: '', patrolArea: '', patrolObservations: '', patrolAction: '', patrolSource: '',
  entryExitStatus: '', unauthorizedAccess: '', restrictedBreaches: '',
  radios: '', cctv: '', barriers: '', otherEquipment: '',
  areasCovered: '', clientAssetIssues: '',
  endOfShiftRemarks: '',
  // Incident Report
  incidentRefNo: '', incidentSeverity: '', incidentDateTime: '', incidentLocation: '',
  incidentType: '', personsInvolved: '', incidentNarrative: '',
  crowdAffected: '', crowdReaction: '', evidenceCollected: '', immediateAction: '',
  escalationReportedTo: '', escalationOrg: '', escalationTime: '', escalationResponse: '',
  followUpAction: '',
  // Final Assessment
  overallImpact: '', securityEffectiveness: '', recommendations: '',
};

type K = keyof FilledReportData;

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b-2 border-zinc-800 pb-2">
        <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 italic mt-1">{subtitle}</p>}
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
      ) : type === 'select' ? null : (
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Surveillance Report</h1>
        </div>
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

        {/* Core Incident Snapshot */}
        <Section title="Core Incident Snapshot" subtitle="Quick Log">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Who (Involved)" name="who" value={data.who} onChange={update} span />
            <Field label="What (Incident/Activity)" name="what" value={data.what} onChange={update} span />
            <Field label="When (Timestamp)" name="when" value={data.when} onChange={update} type="datetime-local" />
            <Field label="Where (Zone/Location)" name="where" value={data.where} onChange={update} />
            <Field label="Latitude / Longitude" name="latLong" value={data.latLong} onChange={update} hint="if applicable" />
            <Field label="Why (Context / Trigger)" name="why" value={data.why} onChange={update} />
            <SelectField label="How (Method / Observation Source)" name="how" value={data.how} onChange={update} options={['Patrol', 'CCTV', 'Public Report']} span />
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

        {/* Section B: Event & Crowd Overview */}
        <Section title="Section B — Event & Crowd Overview" subtitle="Gives context and protects your company if conditions escalate.">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Estimated Crowd Size" name="crowdSize" value={data.crowdSize} onChange={update} options={['Low', 'Moderate', 'High', 'Overcapacity']} />
            <SelectField label="Crowd Behavior" name="crowdBehavior" value={data.crowdBehavior} onChange={update} options={['Calm', 'Excited', 'Agitated', 'Disruptive']} />
            <Field label="Presence of Protesters / Counter-Groups" name="protesters" value={data.protesters} onChange={update} hint="Yes / No + details" span />
            <SelectField label="General Risk Level" name="riskLevel" value={data.riskLevel} onChange={update} options={['Low', 'Medium', 'High']} />
          </div>
        </Section>

        {/* Section C: Daily Activity Report */}
        <Section title="Section C — Daily Activity Report">
          <Field label="Duty Summary / Briefing Notes" name="dutySummary" value={data.dutySummary} onChange={update} span type="textarea" />

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Patrol & Activity Log</h4>
          <div className="grid grid-cols-5 gap-3">
            <Field label="Time" name="patrolTime" value={data.patrolTime} onChange={update} />
            <Field label="Area / Zone" name="patrolArea" value={data.patrolArea} onChange={update} />
            <Field label="Observations & Findings" name="patrolObservations" value={data.patrolObservations} onChange={update} />
            <Field label="Action Taken" name="patrolAction" value={data.patrolAction} onChange={update} />
            <SelectField label="Source" name="patrolSource" value={data.patrolSource} onChange={update} options={['Patrol', 'CCTV', 'Public Report']} />
          </div>

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Access Control & Perimeter Monitoring</h4>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Entry/Exit Points Status" name="entryExitStatus" value={data.entryExitStatus} onChange={update} options={['Normal', 'Congested', 'Breach Risk']} />
            <Field label="Unauthorized Access Attempts" name="unauthorizedAccess" value={data.unauthorizedAccess} onChange={update} hint="Yes / No + details" />
            <Field label="Restricted Area Breaches" name="restrictedBreaches" value={data.restrictedBreaches} onChange={update} hint="Yes / No + details" span />
          </div>

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Equipment & Asset Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Radios" name="radios" value={data.radios} onChange={update} />
            <Field label="CCTV (if applicable)" name="cctv" value={data.cctv} onChange={update} />
            <Field label="Barriers / Fencing" name="barriers" value={data.barriers} onChange={update} />
            <Field label="Other Equipment" name="otherEquipment" value={data.otherEquipment} onChange={update} />
          </div>

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Client Asset Protection</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Areas Covered" name="areasCovered" value={data.areasCovered} onChange={update} hint="Stage / VIP Area / Equipment Zones" />
            <Field label="Issues Affecting Client Assets" name="clientAssetIssues" value={data.clientAssetIssues} onChange={update} hint="None / Describe" />
          </div>

          <div className="mt-6">
            <Field label="End of Shift Remarks" name="endOfShiftRemarks" value={data.endOfShiftRemarks} onChange={update} span type="textarea" />
          </div>
        </Section>

        {/* Section D: Incident Report */}
        <Section title="Section D — Incident Report">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Incident Reference No." name="incidentRefNo" value={data.incidentRefNo} onChange={update} />
            <SelectField label="Severity" name="incidentSeverity" value={data.incidentSeverity} onChange={update} options={['Low', 'Medium', 'High', 'Critical']} />
            <Field label="Date & Time" name="incidentDateTime" value={data.incidentDateTime} onChange={update} type="datetime-local" />
            <Field label="Location / Zone" name="incidentLocation" value={data.incidentLocation} onChange={update} />
            <SelectField label="Type of Incident" name="incidentType" value={data.incidentType} onChange={update} span
              options={['Theft', 'Intrusion / Unauthorized Access', 'Assault / Altercation', 'Medical', 'Fire / Safety Hazard', 'Suspicious Activity', 'Crowd Disturbance', 'Attempted Stage/VIP Breach', 'Other']} />
            <Field label="Persons Involved / Witnesses" name="personsInvolved" value={data.personsInvolved} onChange={update} span type="textarea" hint="Names, descriptions if unknown" />
            <Field label="Incident Narrative" name="incidentNarrative" value={data.incidentNarrative} onChange={update} span type="textarea" hint="Detailed, factual description — no assumptions" />
          </div>

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Crowd Impact</h4>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Did incident affect crowd?" name="crowdAffected" value={data.crowdAffected} onChange={update} options={['Yes', 'No']} />
            <SelectField label="Crowd Reaction" name="crowdReaction" value={data.crowdReaction} onChange={update} options={['None', 'Minor', 'Escalated']} />
          </div>

          <div className="mt-4">
            <Field label="Evidence / Exhibits" name="evidenceCollected" value={data.evidenceCollected} onChange={update} span type="textarea" hint="Photos / Video / CCTV Reference (if any)" />
            <div className="mt-4">
              <Field label="Immediate Action Taken" name="immediateAction" value={data.immediateAction} onChange={update} span type="textarea" hint="What you did on-site" />
            </div>
          </div>

          <h4 className="text-sm font-bold text-zinc-700 mt-6 mb-2 border-b border-zinc-200 pb-1">Escalation & Communication Log</h4>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Reported To" name="escalationReportedTo" value={data.escalationReportedTo} onChange={update} />
            <Field label="Organization" name="escalationOrg" value={data.escalationOrg} onChange={update} />
            <Field label="Time" name="escalationTime" value={data.escalationTime} onChange={update} />
            <Field label="Response" name="escalationResponse" value={data.escalationResponse} onChange={update} />
          </div>
          <p className="text-xs text-zinc-400 italic mt-1">Possible: Supervisor / Client Rep / Police / Medical Team</p>

          <div className="mt-4">
            <Field label="Follow-Up Action Required" name="followUpAction" value={data.followUpAction} onChange={update} span type="textarea" hint="Handovers, monitoring, reporting needs" />
          </div>
        </Section>

        {/* Section E: Final Assessment */}
        <Section title="Section E — Final Assessment" subtitle="Client Value — Overall event security evaluation">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Overall Event Impact" name="overallImpact" value={data.overallImpact} onChange={update} options={['None', 'Minor', 'Moderate', 'Major']} />
            <SelectField label="Security Effectiveness" name="securityEffectiveness" value={data.securityEffectiveness} onChange={update} options={['Satisfactory', 'Needs Improvement']} />
            <Field label="Recommendations" name="recommendations" value={data.recommendations} onChange={update} span type="textarea" />
          </div>
        </Section>

        {/* Sign-Off */}
        <Section title="Sign-Off">
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-8">Reporting Officer Signature: ____________________</p>
              <p className="text-sm text-zinc-600">Date / Time: ____________________</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-8">Supervisor Signature: ____________________</p>
              <p className="text-sm text-zinc-600">Date / Time: ____________________</p>
            </div>
          </div>
        </Section>

      </div>

      {/* Bottom buttons */}
      <div className="flex justify-end gap-3">
        <button onClick={handleReset} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">Clear All</button>
        <button onClick={handleDownload} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">Download Filled PDF</button>
      </div>
    </div>
  );
}
