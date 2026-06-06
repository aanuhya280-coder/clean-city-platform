import { Link } from 'react-router-dom';
import type { Report } from '../types';
import StatusBadge from './StatusBadge';
import { formatRelativeTime, truncate } from '../utils/helpers';
import { MapPin, Clock } from 'lucide-react';

interface Props {
  report: Report;
}

export default function ReportCard({ report }: Props) {
  const imageUrl = report.report_images?.[0]?.image_url;

  return (
    <Link
      to={`/reports/${report.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
    >
      {imageUrl && (
        <div className="aspect-video bg-slate-100 overflow-hidden">
          <img
            src={imageUrl}
            alt="Report"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <StatusBadge status={report.status} size="sm" />
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(report.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-700 mb-2 leading-relaxed">{truncate(report.description, 120)}</p>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{truncate(report.address, 60)}</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">By {report.profiles?.full_name || 'Anonymous'}</div>
      </div>
    </Link>
  );
}
