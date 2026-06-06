import { useState } from 'react';
import { useReports, useUpdateStatus, useDeleteReport, useReportStats } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { REPORT_STATUSES } from '../utils/constants';
import { downloadCSV, formatDate } from '../utils/helpers';
import type { Report, ReportStatus } from '../types';
import { LayoutDashboard, Download, Trash2, RefreshCw, Search, Eye, ChevronDown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user, profile } = useAuth();
  const { data: reports, isLoading } = useReports();
  const { data: stats } = useReportStats();
  const updateStatus = useUpdateStatus();
  const deleteReportMutation = useDeleteReport();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ report: Report; newStatus: ReportStatus } | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [deleteModal, setDeleteModal] = useState<Report | null>(null);

  const filtered = reports?.filter((r) => {
    const matchSearch = !search || r.description.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async () => {
    if (!statusModal || !user) return;
    await updateStatus.mutateAsync({
      reportId: statusModal.report.id,
      newStatus: statusModal.newStatus,
      notes: statusNotes,
      changedBy: user.id,
    });
    setStatusModal(null);
    setStatusNotes('');
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    await deleteReportMutation.mutateAsync(deleteModal.id);
    setDeleteModal(null);
  };

  const handleExport = () => {
    if (!filtered) return;
    const data = filtered.map((r) => ({
      id: r.id,
      description: r.description,
      status: r.status,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      created_at: r.created_at,
      reporter: r.profiles?.full_name || r.profiles?.email || '',
    }));
    downloadCSV(data, `cleancity-reports-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm">Signed in as {profile?.full_name || profile?.email} ({profile?.role})</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xl font-bold text-slate-900">{stats?.total ?? 0}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        {REPORT_STATUSES.map((status) => (
          <div key={status} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xl font-bold text-slate-900">{stats?.byStatus[status] ?? 0}</p>
            <p className="text-xs text-slate-500">{status}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="">All statuses</option>
          {REPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered?.map((report) => {
          const isExpanded = expandedReport === report.id;
          return (
            <div key={report.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpandedReport(isExpanded ? null : report.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={report.status} size="sm" />
                      <span className="text-xs text-slate-400">{formatDate(report.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">{report.description.slice(0, 100)}</p>
                    <p className="text-xs text-slate-400">{report.address}</p>
                    <p className="text-xs text-slate-400 mt-1">By {report.profiles?.full_name || report.profiles?.email || 'Unknown'}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                  <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                  {report.report_images && report.report_images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {report.report_images.map((img) => (
                        <img key={img.id} src={img.image_url} alt="Report" className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-slate-200" />
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/reports/${report.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                    {report.status !== 'Resolved' && (
                      <select
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) setStatusModal({ report, newStatus: e.target.value as ReportStatus });
                        }}
                      >
                        <option value="">Update Status</option>
                        {REPORT_STATUSES.filter((s) => s !== report.status).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => setDeleteModal(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered?.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            No reports match your filters
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900 mb-2">Update Report Status</h3>
            <p className="text-sm text-slate-500 mb-1">
              Change from <StatusBadge status={statusModal.report.status} size="sm" /> to <StatusBadge status={statusModal.newStatus} size="sm" />
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                placeholder="Add notes about this status change..."
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={updateStatus.isPending} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {updateStatus.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteModal}
        title="Delete Report"
        message="This action cannot be undone. The report and all associated data will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </div>
  );
}
