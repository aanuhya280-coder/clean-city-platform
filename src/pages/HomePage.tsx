import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReportStats } from '../hooks/useReports';
import {
  Shield,
  MapPin,
  PlusCircle,
  BarChart3,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { data: stats } = useReportStats();

  const statCards = [
    { label: 'Total Reports', value: stats?.total ?? 0, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Open', value: stats?.byStatus.Open ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'In Progress', value: stats?.byStatus['In Progress'] ?? 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', value: stats?.byStatus.Resolved ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-10 h-10" />
              <span className="text-green-200 font-medium text-lg">CleanCity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Report Garbage.<br />
              Track Progress.<br />
              Build Cleaner Communities.
            </h1>
            <p className="text-green-100 text-lg mb-8 leading-relaxed">
              A transparent platform where citizens report waste issues, officers track progress,
              and everyone can see real-time improvements in their community.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Submit a Report
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 bg-green-500/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500/40 transition-colors border border-green-400/30"
              >
                <Eye className="w-5 h-5" />
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">How It Works</h2>
        <p className="text-slate-500 text-center mb-12 max-w-lg mx-auto">
          Three simple steps to make your community cleaner and more transparent.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: PlusCircle, title: 'Report', desc: 'Snap a photo, mark the location, and describe the issue. Your report is instantly visible to everyone.', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: MapPin, title: 'Track', desc: 'Officers review and update the status in real-time. Watch your report move from Open to Resolved.', color: 'text-sky-600', bg: 'bg-sky-50' },
            { icon: CheckCircle2, title: 'Resolve', desc: 'When the issue is fixed, you get notified. Full transparency with status history and photos.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="text-center">
              <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${color}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Join hundreds of citizens reporting waste issues and tracking community improvements.
          </p>
          {user ? (
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Submit Your First Report
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
