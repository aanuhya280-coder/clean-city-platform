import { useReportStats, useReports } from '../hooks/useReports';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { STATUS_COLORS } from '../utils/constants';
import { BarChart3, AlertCircle, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useReportStats();
  const { data: reports } = useReports();

  const pieData = stats ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })) : [];
  const trendData = stats?.recent ?? [];
  const recentReports = reports?.slice(0, 5) ?? [];

  const resolutionRate = stats
    ? stats.total > 0 ? Math.round(((stats.byStatus.Resolved || 0) / stats.total) * 100) : 0
    : 0;

  const cards = [
    { label: 'Total Reports', value: stats?.total ?? 0, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Open Issues', value: stats?.byStatus.Open ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: stats?.byStatus['In Progress'] ?? 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Public Analytics</h1>
        <p className="text-slate-500 text-sm">Real-time transparency dashboard for community waste reports</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Reports Over Time</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Reports</h3>
        {recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Description</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Address</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-700 max-w-[200px] truncate">{r.description}</td>
                    <td className="py-3 px-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${STATUS_COLORS[r.status]}15`, color: STATUS_COLORS[r.status] }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 max-w-[200px] truncate">{r.address}</td>
                    <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">No reports yet</p>
        )}
      </div>
    </div>
  );
}
