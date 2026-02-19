import React from 'react';
import { Shield, Zap, Users, MapPin, Heart, Activity, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onSignup: () => void;
  onSignin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignup, onSignin }) => {
  return (
    <div className="min-h-screen bg-lifelink-bg font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-lifelink-primary/5 to-lifelink-secondary/5 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lifelink-primary/10 rounded-full text-lifelink-primary font-bold text-sm mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-lifelink-primary animate-pulse"></span>
              v2.0 Now Live on Azure
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
              Emergency Response <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lifelink-primary to-lifelink-secondary">Reimagined by AI</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Turn any smartphone into a life-saving medical device. Real-time crash detection, vital monitoring, and hospital coordination—zero hardware required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onSignup}
                className="group bg-lifelink-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-95 flex items-center gap-2"
              >
                Start Saving Lives
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onSignin}
                className="px-8 py-4 rounded-xl font-bold text-lg text-slate-600 hover:text-lifelink-primary hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                Provider Login
              </button>
            </div>
          </div>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-lifelink-secondary/10 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-lifelink-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Stats / Trust Banner */}
      <section className="border-y border-slate-100 bg-white/50 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="98%" label="Detection Accuracy" />
            <StatItem value="25s" label="Response Time" />
            <StatItem value="50k+" label="Lives Monitored" />
            <StatItem value="24/7" label="Azure Reliability" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-lifelink-bg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Complete Care Ecosystem
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three powerful modules working in perfect sync to provide comprehensive protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<AlertTriangle className="h-8 w-8 text-lifelink-warning" />}
              title="Smart Crash Sensor"
              description="Uses device accelerometer data to detect impacts >4G. Instantly triggers emergency protocols with zero hardware."
              color="warning"
              tags={['Automated', 'GPS Precise', 'Instant']}
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-lifelink-secondary" />}
              title="Remote Patient Monitor"
              description="Clinical-grade vitals tracking (Heart Rate, SpO2) visualized on a doctor-friendly dashboard."
              color="secondary"
              tags={['FHIR Ready', 'Real-time', 'Secure']}
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-lifelink-primary" />}
              title="Care Team Relay"
              description="Secure D2D messaging and live ambulance tracking to coordinate the perfect response."
              color="primary"
              tags={['Encrypted', 'Fast', 'Azure Maps']}
            />
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 z-0"></div>
        <div className="absolute inset-0 bg-lifelink-primary/20 mix-blend-overlay z-0"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-full mb-8">
            <Shield className="w-12 h-12 text-lifelink-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to modernize your emergency response?</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join leading hospitals and rapid response teams using Docent to save minutes and lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignup}
              className="bg-lifelink-primary text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-green-500 transition-all shadow-xl shadow-green-900/50"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div>
    <div className="text-4xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description, color, tags }: { icon: React.ReactNode, title: string, description: string, color: 'primary' | 'secondary' | 'warning', tags: string[] }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-lifelink-${color}/10`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 mb-6 leading-relaxed">
      {description}
    </p>
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default LandingPage;