import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Monitor, Users, BarChart3, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <nav className="flex items-center justify-between px-10 py-6 max-w-7xl mx-auto">
      <div className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">SalesPilot</div>
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
    <section className="max-w-7xl mx-auto px-10 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-7xl font-bold leading-tight text-slate-900">
          The Next Gen <br />
          <span className="bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent font-medium">Sales AI</span> <br />
          Workforce
        </h1>
        <p className="mt-8 text-lg text-slate-600 max-w-md leading-relaxed">
          Autonomous AI Sales Agents designed to supercharge your revenue teams - Prospecting, Outreach, Negotiation, Closing, and beyond.
        </p>
        <div className="mt-10 flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-sky-500/40 transition-all"
          >
            Request Access
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-sky-600 px-8 py-4 rounded-full font-semibold border-2 border-sky-600 hover:bg-sky-50 transition-colors"
          >
            Book a demo
          </motion.button>
        </div>
      </motion.div>

      <div className="relative h-[500px] w-full">
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
    whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.25)' }}
    className="bg-white border border-sky-100 p-8 rounded-[40px] hover:shadow-2xl hover:shadow-sky-500/20 transition-all group cursor-pointer"
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
  <section className="bg-slate-50/50 py-32 px-10">
    <div className="max-w-7xl mx-auto">
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
          <h2 className="text-5xl font-bold text-slate-900 leading-tight">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RoleCard 
          title="SDR" 
          role="AI Worker" 
          skills={['Lead Enrichment', 'Cold Outreach', 'Appointment Setting']} 
          delay={0}
        />
        <RoleCard 
          title="Account Executive" 
          role="AI Worker" 
          skills={['Discovery Calls', 'Demo Presentation', 'Contract Gen']} 
          delay={0.1}
        />
        <RoleCard 
          title="RevOps" 
          role="AI Worker" 
          skills={['Pipeline Hygiene', 'Forecasting', 'Commission Calc']} 
          delay={0.2}
        />
        <RoleCard 
          title="Success" 
          role="AI Worker" 
          skills={['Onboarding', 'QBR Prep', 'Coming Soon']} 
          delay={0.3}
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 px-10 border-t border-sky-100 bg-gradient-to-b from-white to-sky-50/30">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-medium">
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
      <Footer />
    </div>
  );
}
