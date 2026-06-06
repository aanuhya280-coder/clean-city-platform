import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import ReportCard from '../components/ReportCard';
import { REPORT_STATUSES, STATUS_BG_CLASSES } from '../utils/constants';
import { Search, Filter } from 'lucide-react';

export default function PublicFeedPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: reports, isLoading, error, refetch } = useReports({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Public Reports</h1>
          <p className="text-slate-500 text-sm">All community waste reports, visible to everyone</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors sm:hidden"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by area..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !statusFilter ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {REPORT_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? STATUS_BG_CLASSES[status]
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-3">Unable to load reports right now.</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-green-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {reports && reports.length === 0 && (
        <div className="text-center py-20"><p className="text-slate-500">No reports found.</p></div>
      )}

      {reports && reports.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
