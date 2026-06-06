import { useParams, Link } from 'react-router-dom';
import { useReport } from '../hooks/useReports';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, formatRelativeTime } from '../utils/helpers';
import { STATUS_COLORS } from '../utils/constants';
import { ArrowLeft, MapPin, Clock, User, Calendar, ImageIcon, History } from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 mb-4">Report not found.</p>
        <Link to="/feed" className="text-green-600 font-medium hover:underline">Back to reports</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to reports
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={report.status} />
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(report.created_at)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">Report Details</h1>
            <p className="text-slate-600 leading-relaxed mb-4">{report.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {report.address || `${report.latitude}, ${report.longitude}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDateTime(report.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {report.profiles?.full_name || 'Anonymous'}
              </span>
            </div>
            <div className="mt-4 text-xs text-slate-400">Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
          </div>

          {report.report_images && report.report_images.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                <ImageIcon className="w-5 h-5 text-slate-400" />
                Photos ({report.report_images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.report_images.map((img) => (
                  <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity">
                    <img src={img.image_url} alt="Report" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <History className="w-5 h-5 text-slate-400" />
              Status Timeline
            </h2>

            {report.status_history && report.status_history.length > 0 ? (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-4">
                  {report.status_history.slice().reverse().map((entry) => (
                    <div key={entry.id} className="relative pl-8">
                      <div
                        className="absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: STATUS_COLORS[entry.new_status] || '#6B7280' }}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-700">{entry.new_status}</span>
                          {entry.previous_status && <span className="text-xs text-slate-400">from {entry.previous_status}</span>}
                        </div>
                        {entry.notes && <p className="text-xs text-slate-500 mb-1">{entry.notes}</p>}
                        <p className="text-xs text-slate-400">
                          {formatDateTime(entry.changed_at)}
                          {entry.profiles?.full_name && ` by ${entry.profiles.full_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative pl-8 mt-4">
                  <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: STATUS_COLORS.Open }} />
                  <span className="text-sm font-medium text-slate-700">Report Created</span>
                  <p className="text-xs text-slate-400">{formatDateTime(report.created_at)}</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: STATUS_COLORS[report.status] }} />
                <span className="text-sm font-medium text-slate-700">{report.status}</span>
                <p className="text-xs text-slate-400">{formatDateTime(report.created_at)}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Location</h3>
              <p className="text-xs text-slate-400 truncate">{report.address}</p>
            </div>
            <Link to="/map" className="block">
              <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-xs">View on Map</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
