import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateReport, useUploadImage } from '../hooks/useReports';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { reverseGeocode } from '../utils/helpers';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '../utils/constants';
import { MapPin, Camera, X, Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SubmitReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createReport = useCreateReport();
  const uploadImage = useUploadImage();
  const { location, loading: geoLoading, error: geoError, getLocation } = useGeoLocation();

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => { getLocation(); }, [getLocation]);

  const setAddressFromCoords = useCallback(async (latitude: number, longitude: number) => {
    setAddressLoading(true);
    const addr = await reverseGeocode(latitude, longitude);
    setAddress(addr);
    setAddressLoading(false);
  }, []);

  useEffect(() => {
    if (location) {
      setLat(location.latitude);
      setLng(location.longitude);
      setAddressFromCoords(location.latitude, location.longitude);
    }
  }, [location, setAddressFromCoords]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE);
    if (valid.length < selected.length) setError('Some files skipped (invalid type or size > 10MB)');
    setFiles((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lat || !lng) return;
    if (!description.trim()) { setError('Please describe the issue'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const report = await createReport.mutateAsync({
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        address: address || `${lat}, ${lng}`,
        user_id: user.id,
      });

      for (const file of files) {
        await uploadImage.mutateAsync({ reportId: report.id, file });
      }

      navigate(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit a Report</h1>
      <p className="text-slate-500 mb-8">Report a garbage or waste issue in your area</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Describe the issue</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            placeholder="What kind of waste? How large is the area? Any specific details..."
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-3">Location</label>
          {geoError && (
            <p className="text-sm text-amber-600 mb-3 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Location access denied. You can manually enter coordinates.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat ?? ''}
                onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g. 28.6139"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng ?? ''}
                onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g. 77.2090"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={getLocation}
              disabled={geoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Get my location
            </button>
            {lat && lng && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Located
              </span>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Address</label>
            <input
              type="text"
              value={addressLoading ? 'Looking up address...' : address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Address will auto-fill from GPS"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Photos (optional)</label>
          <p className="text-xs text-slate-400 mb-3">JPG, PNG, or WebP. Max 10MB each.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs text-slate-400">Add</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !lat || !lng}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            <><Camera className="w-5 h-5" /> Submit Report</>
          )}
        </button>
      </form>
    </div>
  );
}
