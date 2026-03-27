import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { exportReportTemplateToPDF, exportReportTemplateToWord } from '../lib/export';

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
}

export default function ReportForm() {
  const [formData, setFormData] = useState({ reportType: 'activity', who: '', what: '', when: '', where: '', latitude: '', longitude: '', why: '', how: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('You must be logged in to submit a report.');
      return;
    }

    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `reports/${auth.currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'reports'), {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        imageUrl,
        authorUid: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      setFormData({ reportType: 'activity', who: '', what: '', when: '', where: '', latitude: '', longitude: '', why: '', how: '' });
      setImageFile(null);
      alert('Report submitted!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const fields: { name: 'who' | 'what' | 'when' | 'where' | 'latitude' | 'longitude' | 'why' | 'how', label: string, type?: string }[] = [
    { name: 'who', label: 'Who (Involved)' },
    { name: 'what', label: 'What (Incident/Activity)' },
    { name: 'when', label: 'When (Timestamp)', type: 'datetime-local' },
    { name: 'where', label: 'Where (Zone/Location)' },
    { name: 'latitude', label: 'Latitude', type: 'number' },
    { name: 'longitude', label: 'Longitude', type: 'number' },
    { name: 'why', label: 'Why (Context)' },
    { name: 'how', label: 'How (Methodology)' },
  ];

  const lat = parseFloat(formData.latitude);
  const lng = parseFloat(formData.longitude);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-zinc-200 rounded-xl shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Submit Security Report</h2>
        <div className="space-x-2">
          <button type="button" onClick={exportReportTemplateToPDF} className="bg-zinc-100 text-zinc-900 px-3 py-1 rounded text-sm hover:bg-zinc-200">Export PDF Template</button>
          <button type="button" onClick={exportReportTemplateToWord} className="bg-zinc-100 text-zinc-900 px-3 py-1 rounded text-sm hover:bg-zinc-200">Export Word Template</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Report Type</label>
        <select value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})} className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900">
          <option value="activity">Activity Report</option>
          <option value="incident">Incident Report</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.name} className={field.name === 'what' || field.name === 'why' || field.name === 'how' ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-zinc-700 mb-2">{field.label}</label>
            <input 
              required
              type={field.type || 'text'}
              placeholder={field.label} 
              value={formData[field.name]} 
              onChange={e => setFormData({...formData, [field.name]: e.target.value})} 
              className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900" 
            />
          </div>
        ))}
        {(!isNaN(lat) && !isNaN(lng)) && (
          <div className="col-span-2 h-64 rounded-lg overflow-hidden border border-zinc-300">
            <MapContainer center={[lat, lng]} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]} />
              <MapUpdater lat={lat} lng={lng} />
            </MapContainer>
          </div>
        )}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Upload Image (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setImageFile(e.target.files?.[0] || null)}
            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900" 
          />
        </div>
      </div>
      <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors">Submit Report</button>
    </form>
  );
}
