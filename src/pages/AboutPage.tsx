import { Shield, Users, Eye, Target, Heart, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">About CleanCity</h1>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
          CleanCity is a public transparency platform that empowers citizens to report waste issues
          and track their resolution in real-time, building cleaner and healthier communities.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Users, title: 'Citizen Empowerment', desc: 'Every citizen can report waste issues with photos and GPS location. Your voice matters and your reports are visible to the entire community.' },
          { icon: Eye, title: 'Full Transparency', desc: 'All reports are publicly visible. Track status changes, view resolution timelines, and see exactly how your community is being served.' },
          { icon: Target, title: 'Accountability', desc: 'Officers and administrators update report statuses in real-time. The full status history is publicly available, ensuring accountability.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-white mb-12">
        <h2 className="text-2xl font-bold mb-4">Community Impact</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-green-100 leading-relaxed mb-4">
              When citizens can report waste issues and track their resolution, communities become cleaner,
              healthier, and more livable. Transparency drives accountability, and accountability drives action.
            </p>
            <p className="text-green-100 leading-relaxed">
              Every report submitted is a step toward a cleaner neighborhood. Every status update is proof
              that the system is working. Together, we build communities we can be proud of.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Heart, text: 'Healthier living environments' },
              { icon: Globe, text: 'Open data for all citizens' },
              { icon: Eye, text: 'Real-time progress tracking' },
              { icon: Users, text: 'Community-driven accountability' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Open Platform</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          CleanCity is built on open data principles. All reports are publicly accessible,
          ensuring every citizen has the right to know about waste management in their community.
        </p>
      </div>
    </div>
  );
}
