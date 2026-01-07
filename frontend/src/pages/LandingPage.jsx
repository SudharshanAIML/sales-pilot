import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Monitor, Users, BarChart3, ShieldCheck, Sun, Moon, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <nav className="flex items-center justify-between px-16 py-6 max-w-[1600px] mx-auto">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent cursor-pointer"
      >
        SalesPilot
      </motion.div>
      <div className="hidden md:flex bg-sky-50 rounded-full px-2 py-1 border border-sky-100">
        {['Solution', 'About', 'App'].map((item) => (
          <button 
            key={item} 
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2 rounded-full font-medium text-sm hover:from-sky-600 hover:to-sky-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/30"
        >
          Sign In
        </button>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-sky-50 rounded-full cursor-pointer transition-all"
        >
          {darkMode ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-slate-600" />}
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-[1600px] mx-auto px-16 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-8xl font-bold leading-tight text-slate-900">
          The Next Gen <br />
          <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent font-medium">Sales AI</span> <br />
          Workforce
        </h1>
        <p className="mt-8 text-xl text-slate-600 max-w-xl leading-relaxed">
          An autonomous AI sales system that understands customers, decides actions, and executes outreach end-to-end — proactively driving revenue while respecting customer intent, control, and trust.
        </p>
      </motion.div>

      <div className="relative h-[600px] w-full">
        {/* 3D Laptop Visualization with Dark Background */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Animated lines/grid effect */}
          <div className="absolute inset-0">
            <motion.div 
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 right-1/4 w-64 h-64 border border-sky-500/20 rounded-full"
            />
            <motion.div 
              animate={{ 
                y: [0, -100, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/3 left-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"
            />
            <motion.div 
              animate={{ 
                y: [0, 100, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 right-1/3 w-1 h-24 bg-gradient-to-b from-transparent via-sky-500/50 to-transparent"
            />
          </div>
          
          {/* Laptop Screen Mockup */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative w-[400px] h-[250px] bg-slate-800 rounded-lg shadow-2xl border-4 border-slate-700"
            >
              {/* Screen content */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 to-slate-900 rounded-md p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div className="h-2 w-24 bg-slate-600 rounded" />
                  </div>
                  <div className="h-1 w-full bg-slate-700 rounded" />
                  <div className="h-1 w-3/4 bg-slate-700 rounded" />
                  <div className="h-16 w-full bg-slate-700/50 rounded mt-4 border border-sky-500/30" />
                </div>
              </div>
              {/* Laptop base */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[420px] h-3 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl" />
            </motion.div>
          </div>
        </motion.div>

        {/* Floating UI Cards overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-20 -left-10 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white max-w-[240px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deal</span>
            </div>
            <p className="text-sm font-bold text-slate-800">Enterprise License - Acme Corp</p>
            <p className="text-[11px] text-slate-500 mt-1">AI Agent negotiated 15% discount for 2yr term.</p>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute bottom-40 -right-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-sky-600" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold">Lead Qualifier</p>
                <div className="w-32 h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="h-full bg-sky-500"
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">75%</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const RoleCard = ({ title, role, skills, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.35)' }}
    className="bg-white border-2 border-sky-100 p-8 rounded-[40px] hover:shadow-2xl hover:shadow-sky-500/30 transition-all group cursor-pointer hover:border-sky-300"
  >
    <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-6 border border-sky-100 group-hover:bg-sky-100 group-hover:border-sky-200 transition-all">
      <div className="w-1.5 h-1.5 bg-sky-600 rounded-full group-hover:bg-sky-700 transition-all" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-1">{title}</h3>
    <p className="text-sky-600 text-sm mb-8 font-medium">{role}</p>
    
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">AI Skills</span>
      <Plus size={14} className="text-sky-400 group-hover:text-sky-600 transition-colors" />
    </div>
    
    <div className="flex flex-wrap gap-2">
      {skills.map(skill => (
        <span 
          key={skill} 
          className="px-4 py-2 bg-sky-50 text-sky-700 text-[11px] font-semibold rounded-full border border-sky-100 group-hover:bg-sky-100 group-hover:text-sky-800 group-hover:border-sky-200 transition-all"
        >
          {skill}
        </span>
      ))}
    </div>
  </motion.div>
);

const Features = () => (
  <section className="bg-slate-50/50 py-32 px-16">
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-sky-600 rounded-full" />
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">AI Sales Workers</span>
          </div>
          <h2 className="text-6xl font-bold text-slate-900 leading-tight">
            Role-specific super-agents, <br />
            <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">ready to close deals.</span>
          </h2>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md text-slate-600 text-lg leading-relaxed mb-2"
        >
          Ready to work with pre-trained sales skills. AI Workers are platform agnostic and customizable to your specific sales methodologies without complex configuration.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <RoleCard 
          title="Custom Relationship Agent" 
          role="AI Worker" 
          skills={['Lead Enrichment', 'Cold Outreach', 'Appointment Setting']} 
          delay={0}
        />
        <RoleCard 
          title="Revenue Agent" 
          role="AI Worker" 
          skills={['Discovery Calls', 'Demo Presentation', 'Contract Gen']} 
          delay={0.1}
        />
        <RoleCard 
          title="Product Analytics Agent" 
          role="AI Worker" 
          skills={['Pipeline Hygiene', 'Forecasting', 'Commission Calc']} 
          delay={0.2}
        />
        <RoleCard 
          title="Delivery Tracking Agent" 
          role="AI Worker" 
          skills={['Onboarding', 'QBR Prep', 'Tracking']} 
          delay={0.3}
        />
        <RoleCard 
          title="Outreach Agent" 
          role="AI Worker" 
          skills={['Email Campaigns', 'Follow-ups', 'Engagement']} 
          delay={0.4}
        />
      </div>
    </div>
  </section>
);

const ComparisonSection = () => {
  const [selectedCompetitor, setSelectedCompetitor] = React.useState('Salesforce');
  
  const competitors = ['Salesforce', 'HubSpot', 'Zoho CRM', 'Odoo'];
  
  const allFeatures = {
    'SalesPilot': [
      {
        id: 1,
        title: 'Fully Autonomous End-to-End Sales Execution',
        description: 'Complete automation from prospecting to booking and CRM updates',
        status: true
      },
      {
        id: 2,
        title: 'Company-Document RAG Email Personalization',
        description: 'AI-powered email personalization using company documents and context',
        status: true
      },
      {
        id: 3,
        title: 'Independent Agentic Decision Engine',
        description: 'AI decides who and when to contact, not just recommendations',
        status: true
      },
      {
        id: 4,
        title: 'Explicit Assist Mode vs Full Pilot Mode Toggle',
        description: 'Switch between AI assistance and full autonomous operation',
        status: true
      },
      {
        id: 5,
        title: 'User-Controlled AI Message Tone + Frequency',
        description: 'Customize AI communication style and cadence to match your brand',
        status: true
      }
    ],
    'Salesforce': [
      {
        id: 1,
        title: 'Fully Autonomous End-to-End Sales Execution',
        description: 'Complete automation from prospecting to booking and CRM updates',
        status: false
      },
      {
        id: 2,
        title: 'Company-Document RAG Email Personalization',
        description: 'AI-powered email personalization using company documents and context',
        status: false
      },
      {
        id: 3,
        title: 'Independent Agentic Decision Engine',
        description: 'AI decides who and when to contact, not just recommendations',
        status: false
      },
      {
        id: 4,
        title: 'Explicit Assist Mode vs Full Pilot Mode Toggle',
        description: 'Switch between AI assistance and full autonomous operation',
        status: true
      },
      {
        id: 5,
        title: 'User-Controlled AI Message Tone + Frequency',
        description: 'Customize AI communication style and cadence to match your brand',
        status: true
      }
    ],
    'HubSpot': [
      {
        id: 1,
        title: 'Fully Autonomous End-to-End Sales Execution',
        description: 'Complete automation from prospecting to booking and CRM updates',
        status: false
      },
      {
        id: 2,
        title: 'Company-Document RAG Email Personalization',
        description: 'AI-powered email personalization using company documents and context',
        status: true
      },
      {
        id: 3,
        title: 'Independent Agentic Decision Engine',
        description: 'AI decides who and when to contact, not just recommendations',
        status: false
      },
      {
        id: 4,
        title: 'Explicit Assist Mode vs Full Pilot Mode Toggle',
        description: 'Switch between AI assistance and full autonomous operation',
        status: false
      },
      {
        id: 5,
        title: 'User-Controlled AI Message Tone + Frequency',
        description: 'Customize AI communication style and cadence to match your brand',
        status: true
      }
    ],
    'Zoho CRM': [
      {
        id: 1,
        title: 'Fully Autonomous End-to-End Sales Execution',
        description: 'Complete automation from prospecting to booking and CRM updates',
        status: false
      },
      {
        id: 2,
        title: 'Company-Document RAG Email Personalization',
        description: 'AI-powered email personalization using company documents and context',
        status: false
      },
      {
        id: 3,
        title: 'Independent Agentic Decision Engine',
        description: 'AI decides who and when to contact, not just recommendations',
        status: true
      },
      {
        id: 4,
        title: 'Explicit Assist Mode vs Full Pilot Mode Toggle',
        description: 'Switch between AI assistance and full autonomous operation',
        status: false
      },
      {
        id: 5,
        title: 'User-Controlled AI Message Tone + Frequency',
        description: 'Customize AI communication style and cadence to match your brand',
        status: true
      }
    ],
    'Odoo': [
      {
        id: 1,
        title: 'Fully Autonomous End-to-End Sales Execution',
        description: 'Complete automation from prospecting to booking and CRM updates',
        status: false
      },
      {
        id: 2,
        title: 'Company-Document RAG Email Personalization',
        description: 'AI-powered email personalization using company documents and context',
        status: false
      },
      {
        id: 3,
        title: 'Independent Agentic Decision Engine',
        description: 'AI decides who and when to contact, not just recommendations',
        status: false
      },
      {
        id: 4,
        title: 'Explicit Assist Mode vs Full Pilot Mode Toggle',
        description: 'Switch between AI assistance and full autonomous operation',
        status: true
      },
      {
        id: 5,
        title: 'User-Controlled AI Message Tone + Frequency',
        description: 'Customize AI communication style and cadence to match your brand',
        status: true
      }
    ]
  };

  const salesPilotFeatures = allFeatures['SalesPilot'];
  const competitorFeatures = allFeatures[selectedCompetitor] || [];

  return (
    <section className="py-32 px-16 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-sky-600 rounded-full" />
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Why Choose SalesPilot</span>
          </div>
          <h2 className="text-6xl font-bold text-slate-900 mb-6">
            Features that set us <br />
            <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">apart from the rest.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare SalesPilot's advanced AI capabilities with traditional CRM platforms
          </p>
        </motion.div>

        {/* Competitor Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <div className="inline-flex bg-white rounded-full p-2 border border-sky-200 shadow-lg shadow-sky-500/10">
            {competitors.map((competitor) => (
              <button
                key={competitor}
                onClick={() => setSelectedCompetitor(competitor)}
                className={`px-8 py-3 text-base font-semibold rounded-full transition-all ${
                  selectedCompetitor === competitor
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                {competitor}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feature Comparison - 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {salesPilotFeatures
            .map(spFeature => {
              const compFeature = competitorFeatures.find(f => f.id === spFeature.id);
              return { spFeature, compFeature };
            })
            .sort((a, b) => {
              // Sort: available/partial features first, then not available
              const aHasFeature = a.compFeature?.status === true || a.compFeature?.status === 'partial';
              const bHasFeature = b.compFeature?.status === true || b.compFeature?.status === 'partial';
              if (aHasFeature && !bHasFeature) return -1;
              if (!aHasFeature && bHasFeature) return 1;
              return 0;
            })
            .map(({ spFeature, compFeature }, index) => (
              <motion.div
                key={spFeature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Feature Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{spFeature.title}</h3>
                <p className="text-sm text-slate-600 mb-6">{spFeature.description}</p>

                {/* Comparison Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {/* SalesPilot Status */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                      <Check className="text-white" size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sky-600">SalesPilot</p>
                      <p className="text-[10px] text-green-600 font-semibold">Available</p>
                    </div>
                  </div>

                  {/* Competitor Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      compFeature?.status === false
                        ? 'bg-slate-200'
                        : compFeature?.status === 'partial'
                        ? 'bg-amber-100'
                        : 'bg-green-100'
                    }`}>
                      {compFeature?.status === false ? (
                        <X className="text-slate-500" size={14} strokeWidth={3} />
                      ) : compFeature?.status === 'partial' ? (
                        <div className="w-3 h-0.5 bg-amber-600 rounded" />
                      ) : (
                        <Check className="text-green-600" size={14} strokeWidth={3} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{selectedCompetitor}</p>
                      <p className={`text-[10px] font-semibold ${
                        compFeature?.status === false
                          ? 'text-slate-500'
                          : compFeature?.status === 'partial'
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {compFeature?.status === false ? 'Not Available' : compFeature?.status === 'partial' ? 'Partial' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-slate-600 mb-6 text-lg">Ready to experience the future of sales automation?</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-10 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-sky-500/40 transition-all hover:scale-105"
          >
            Get Started with SalesPilot
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-16 border-t border-sky-100 bg-gradient-to-b from-white to-sky-50/30">
    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center text-base text-slate-500 font-medium">
      <div className="bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent font-bold text-lg mb-4 md:mb-0">SalesPilot</div>
      <div className="flex gap-8 mb-4 md:mb-0">
        <a href="#" className="hover:text-sky-600 transition-colors">Privacy</a>
        <a href="#" className="hover:text-sky-600 transition-colors">Terms</a>
        <a href="#" className="hover:text-sky-600 transition-colors">Twitter</a>
      </div>
      <div>© 2024 SalesPilot AI Inc.</div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-600">
      <Navbar />
      <Hero />
      <Features />
      <ComparisonSection />
      <Footer />
    </div>
  );
}
