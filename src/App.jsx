import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Home, PieChart as PieChartIcon, TrendingUp, Target, Lightbulb, User, Settings, 
  LogOut, Menu, X, ArrowRight, CheckCircle2, AlertCircle, Wallet, 
  ShieldCheck, ArrowUpRight, ArrowDownRight, Zap, ChevronRight,
  Activity, Lock, Sparkles, MessageSquare, Briefcase, Bot, Send
} from 'lucide-react';

// --- CONTEXT & STATE MANAGEMENT ---
const AppContext = createContext();

const initialUserData = {
  name: 'Alex Doe',
  email: 'alex@example.com',
  monthlyIncome: 120000,
  monthlyExpenses: 75000,
  monthlyInvestments: 25000,
  currentNetWorth: 1500000,
  currentAge: 28,
  targetRetirementAge: 45,
  expectedReturnRate: 12,
  portfolio: [
    { name: 'Indian Equity', value: 60, color: '#10b981' },
    { name: 'Global Equity', value: 15, color: '#0ea5e9' },
    { name: 'Debt Funds', value: 15, color: '#64748b' },
    { name: 'Gold/Crypto', value: 10, color: '#f59e0b' },
  ],
  goals: [
    { id: 1, name: 'Emergency Fund', target: 500000, current: 400000 },
    { id: 2, name: 'House Downpayment', target: 2500000, current: 800000 },
  ]
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in
  const [userData, setUserData] = useState(initialUserData);
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (route) => {
    setCurrentRoute(route);
    setIsSidebarOpen(false); // Auto-close sidebar on mobile navigation
  };

  const login = (email) => {
    setUser({ email, token: 'dummy-jwt-token' });
    navigate('dashboard');
  };

  const logout = () => {
    setUser(null);
    navigate('landing');
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <AppContext.Provider value={{ 
      user, userData, currentRoute, navigate, login, logout, 
      isSidebarOpen, setIsSidebarOpen, updateUserData 
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

// --- UTILS & FINANCIAL LOGIC ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateFinancialHealth = (data) => {
  const savings = data.monthlyIncome - data.monthlyExpenses;
  const savingsRate = (savings / data.monthlyIncome) * 100;
  const investmentRate = (data.monthlyInvestments / data.monthlyIncome) * 100;
  
  let score = 50;
  if (savingsRate >= 30) score += 25;
  else if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 5;

  if (investmentRate >= 20) score += 25;
  else if (investmentRate >= 10) score += 15;
  
  const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention';
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';

  return { savings, savingsRate, investmentRate, score: Math.min(100, score), status, color };
};

const calculateFIRE = (data) => {
  const years = data.targetRetirementAge - data.currentAge;
  const monthlyRate = data.expectedReturnRate / 12 / 100;
  const months = years * 12;
  
  // Future Value of current net worth
  const fvNetWorth = data.currentNetWorth * Math.pow(1 + monthlyRate, months);
  // Future Value of monthly SIPs
  const fvSIP = data.monthlyInvestments * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  
  const totalCorpus = fvNetWorth + fvSIP;
  
  // Generating chart data
  const chartData = [];
  let currentCorpus = data.currentNetWorth;
  for (let i = 0; i <= years; i++) {
    chartData.push({
      age: data.currentAge + i,
      corpus: Math.round(currentCorpus),
    });
    // Add 1 year of growth and 1 year of investments
    for(let m=0; m<12; m++) {
      currentCorpus = currentCorpus * (1 + monthlyRate) + data.monthlyInvestments;
    }
  }

  return { totalCorpus, chartData, years };
};

// --- REUSABLE UI COMPONENTS ---
// Made padding responsive (p-4 for mobile, sm:p-6 for larger screens)
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

// Improved touch target sizes (py-3)
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 focus:ring-slate-900",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 focus:ring-emerald-500",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Improved touch target sizes for inputs (py-3)
const Input = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={`block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500 text-sm transition-colors py-3 ${Icon ? 'pl-11' : 'pl-4'} pr-4 border outline-none min-h-[44px]`}
        {...props} 
      />
    </div>
  </div>
);

// --- GLOBAL FOOTER COMPONENT ---
const CreatorFooter = () => {
  const { navigate } = useAppContext();
  return (
    <footer className="border-t border-slate-200/60 bg-white pt-10 pb-8 sm:pt-12 sm:pb-10 mt-auto w-full shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => navigate('landing')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">SmartMoney AI</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=DharamRathod&backgroundColor=e2e8f0" 
              alt="Dharam Rathod" 
              className="w-8 h-8 rounded-full border border-slate-200 group-hover:scale-110 transition-transform"
            />
            <span className="text-sm font-medium text-slate-600">
              Created by <span className="font-bold text-emerald-600">Dharam Rathod</span>
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-xs sm:text-sm mt-4 sm:mt-6">© 2026 SmartMoney AI. Premium FinTech Experience.</p>
      </div>
    </footer>
  );
};

// --- PAGES ---

const LandingPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-200 text-slate-900 font-sans flex flex-col overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('landing')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shrink-0">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate">SmartMoney AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('login')}>Log in</Button>
            <Button variant="primary" onClick={() => navigate('signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium mb-2 sm:mb-4">
            <Zap size={14} /> Meet your new financial brain
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Master your money. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              Automate your future.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            The premium personal finance mentor that analyzes your spending, optimizes your savings, and builds your custom path to financial independence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto px-4 sm:px-0">
            <Button variant="secondary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full" onClick={() => navigate('signup')}>
              Start Planning Free <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: Activity, title: 'Money Health Score', desc: 'Real-time analysis of your income, expenses, and savings rate wrapped in a beautiful dashboard.' },
            { icon: Target, title: 'FIRE Planner', desc: 'Dynamic projections using compound interest algorithms to pinpoint your exact retirement date.' },
            { icon: Lightbulb, title: 'AI-Powered Insights', desc: 'Smart alerts and actionable recommendations tailored to your unique financial footprint.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 mb-4 sm:mb-6 border border-slate-100">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <CreatorFooter />
    </div>
  );
};

const AuthPage = ({ mode = 'login' }) => {
  const { login, navigate } = useAppContext();
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if(email) login(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full my-8 sm:my-12">
          <div className="text-center mb-8 sm:mb-10 cursor-pointer" onClick={() => navigate('landing')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              {mode === 'login' ? 'Enter your details to access your dashboard.' : 'Start your journey to financial freedom.'}
            </p>
          </div>

          <Card className="shadow-xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {mode === 'signup' && (
                <Input label="Full Name" placeholder="Alex Doe" icon={User} required />
              )}
              <Input 
                label="Email address" 
                type="email" 
                placeholder="alex@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Lock} 
                required 
              />
              <Input label="Password" type="password" placeholder="••••••••" icon={Lock} required />
              
              <Button variant="primary" className="w-full text-base mt-2" type="submit">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="text-emerald-600 font-semibold hover:text-emerald-700 min-h-[44px] px-2 py-1"
                onClick={() => navigate(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </Card>
        </div>
      </div>
      <CreatorFooter />
    </div>
  );
};

const DashboardLayout = ({ children }) => {
  const { currentRoute, navigate, isSidebarOpen, setIsSidebarOpen, logout, userData } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'portfolio', label: 'Pro Portfolio', icon: Briefcase },
    { id: 'advisor', label: 'AI Advisor', icon: MessageSquare },
    { id: 'money-score', label: 'Money Score', icon: Activity },
    { id: 'planner', label: 'FIRE Planner', icon: Target },
    { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
    { id: 'simulation', label: 'Future Sim', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar (Mobile & Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            SmartMoney
          </div>
          <button className="lg:hidden text-slate-500 p-2 -mr-2 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                currentRoute === item.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={currentRoute === item.id ? 'text-emerald-600' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200/50">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
              {userData.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{userData.name}</p>
              <p className="text-xs text-slate-500 truncate">{userData.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[44px]"
          >
            <LogOut size={16} /> Sign out
          </button>

          {/* SIDEBAR CREATOR ATTRIBUTION */}
          <div className="mt-4 flex items-center justify-center gap-2 py-3 border-t border-slate-100 opacity-70 hover:opacity-100 transition-opacity">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=DharamRathod&backgroundColor=e2e8f0" 
              alt="Dharam Rathod" 
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-slate-500 font-medium">By Dharam Rathod</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30 shrink-0">
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2 sm:gap-4">
               <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                 <AlertCircle size={20} />
               </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
          <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </div>
          <CreatorFooter />
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const DashboardHome = () => {
  const { userData, navigate } = useAppContext();
  const health = calculateFinancialHealth(userData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {userData.name.split(' ')[0]}. Here's your financial summary.</p>
        </div>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('planner')}>
          Plan Retirement <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} /></div>
          <p className="text-slate-400 text-sm font-medium">Net Worth</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-all">{formatCurrency(userData.currentNetWorth)}</h2>
          <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
            <ArrowUpRight size={16} className="mr-1" /> +12.5% this year
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Monthly Savings</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 break-all">{formatCurrency(health.savings)}</h2>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-semibold text-emerald-600 mr-2">{health.savingsRate.toFixed(1)}%</span>
            <span className="text-slate-500">of income saved</span>
          </div>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Money Score</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{health.score} <span className="text-slate-400 text-lg">/ 100</span></h2>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${health.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${health.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              style={{ width: `${health.score}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="flex flex-col min-w-0">
          <h3 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Income vs Expenses</h3>
          <div className="h-56 sm:h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', income: 120000, expenses: 78000 },
                { name: 'Feb', income: 120000, expenses: 72000 },
                { name: 'Mar', income: 120000, expenses: 75000 },
                { name: 'Apr', income: 120000, expenses: 80000 },
                { name: 'May', income: userData.monthlyIncome, expenses: userData.monthlyExpenses },
              ]} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6">Quick Actions</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { title: 'Chat with Advisor', desc: 'Ask AI about your finances', icon: Bot, route: 'advisor' },
              { title: 'Update Financials', desc: 'Log your latest income & expenses', icon: Wallet, route: 'profile' },
              { title: 'View Insights', desc: 'See personalized AI recommendations', icon: Lightbulb, route: 'insights' },
            ].map((action, i) => (
              <div key={i} className="flex items-center p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer group" onClick={() => navigate(action.route)}>
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-600 transition-colors mr-3 sm:mr-4 shrink-0">
                  <action.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{action.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Advanced Goals Tracking Section */}
      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="text-emerald-500" size={20} /> Goal Tracker
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {userData.goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <Card key={goal.id} className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900 truncate pr-2">{goal.name}</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md shrink-0">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-wrap items-end gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">{formatCurrency(goal.current)}</span>
                  <span className="text-xs sm:text-sm text-slate-500 mb-1">/ {formatCurrency(goal.target)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-emerald-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MoneyScore = () => {
  const { userData } = useAppContext();
  const health = calculateFinancialHealth(userData);

  // SVG Circle calculation
  const radius = 70; // Slightly smaller to fit mobile screens better
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Money Health Score</h1>
        <p className="text-slate-500 text-sm mt-1">A comprehensive look at your financial vitality.</p>
      </div>

      <Card className="flex flex-col items-center py-8 sm:py-10">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%" cy="50%" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="50%" cy="50%" r={radius}
              stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${health.score >= 80 ? 'text-emerald-500' : health.score >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{health.score}</span>
            <span className={`text-xs sm:text-sm font-semibold mt-1 ${health.color}`}>{health.status}</span>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-md text-center">
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
            <p className="text-xs sm:text-sm text-slate-500 mb-1">Savings Rate</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900">{health.savingsRate.toFixed(1)}%</p>
            <p className="text-[10px] sm:text-xs text-emerald-600 mt-1">Target: &ge;20%</p>
          </div>
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
            <p className="text-xs sm:text-sm text-slate-500 mb-1">Investment Rate</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900">{health.investmentRate.toFixed(1)}%</p>
            <p className="text-[10px] sm:text-xs text-emerald-600 mt-1">Target: &ge;15%</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center"><CheckCircle2 className="text-emerald-500 mr-2 shrink-0" size={18}/> What you're doing right</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            {health.savingsRate >= 20 ? <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Excellent savings discipline.</li> : null}
            {health.investmentRate >= 10 ? <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Actively growing your wealth via investments.</li> : null}
            {userData.currentNetWorth > 1000000 ? <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Strong base net worth established.</li> : null}
            {health.score < 60 && <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> You're tracking your finances, which is the first step.</li>}
          </ul>
        </Card>
        <Card>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center"><AlertCircle className="text-amber-500 mr-2 shrink-0" size={18}/> Areas to improve</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            {health.savingsRate < 20 ? <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Try to reduce discretionary expenses to boost savings.</li> : null}
            {health.investmentRate < 10 ? <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Allocate more of your savings towards SIPs.</li> : null}
            {health.score >= 80 && <li className="flex items-start"><span className="mr-2 mt-0.5">•</span> Keep optimizing tax strategies and avoiding lifestyle inflation.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const FIREPlanner = () => {
  const { userData, updateUserData } = useAppContext();
  const fireData = calculateFIRE(userData);

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">FIRE Planner</h1>
        <p className="text-slate-500 text-sm mt-1">Financial Independence, Retire Early. Project your corpus based on SIPs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Assumptions</h3>
            <div className="space-y-4">
              <Input 
                label="Current Age" 
                type="number" 
                value={userData.currentAge}
                onChange={(e) => updateUserData({ currentAge: Number(e.target.value) })}
              />
              <Input 
                label="Target Retirement Age" 
                type="number" 
                value={userData.targetRetirementAge}
                onChange={(e) => updateUserData({ targetRetirementAge: Number(e.target.value) })}
              />
              <Input 
                label="Monthly SIP (₹)" 
                type="number" 
                value={userData.monthlyInvestments}
                onChange={(e) => updateUserData({ monthlyInvestments: Number(e.target.value) })}
              />
              <Input 
                label="Expected Return (%)" 
                type="number" 
                step="0.1"
                value={userData.expectedReturnRate}
                onChange={(e) => updateUserData({ expectedReturnRate: Number(e.target.value) })}
              />
            </div>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-6 order-1 xl:order-2">
          <Card className="bg-slate-900 text-white border-none text-center py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Target size={160} />
            </div>
            <p className="text-slate-400 font-medium relative z-10 text-sm sm:text-base">Projected Corpus at Age {userData.targetRetirementAge}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 relative z-10 break-all">
              {formatCurrency(fireData.totalCorpus)}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 sm:mt-4 relative z-10">
              In {fireData.years} years, assuming {userData.expectedReturnRate}% CAGR.
            </p>
          </Card>

          <Card className="flex flex-col min-w-0">
            <h3 className="font-bold text-slate-900 mb-4 sm:mb-6">Wealth Growth Trajectory</h3>
            <div className="h-64 sm:h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fireData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="age" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    tickLine={false} 
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Corpus']}
                    labelFormatter={(label) => `Age: ${label}`}
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="corpus" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCorpus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InsightsPage = () => {
  const { userData } = useAppContext();
  const health = calculateFinancialHealth(userData);

  const insights = useMemo(() => {
    const list = [];
    if (health.savingsRate < 20) {
      list.push({
        type: 'danger', icon: AlertCircle,
        title: 'High Expense Warning',
        desc: `Your expenses consume ${(100 - health.savingsRate).toFixed(0)}% of your income. Aim to reduce discretionary spending by ₹${(userData.monthlyIncome * 0.2 - health.savings).toFixed(0)} to hit a safe 20% savings rate.`
      });
    } else {
      list.push({
        type: 'success', icon: CheckCircle2,
        title: 'Optimal Savings Rate',
        desc: `Great job! You are saving ${health.savingsRate.toFixed(1)}% of your income. You are building a solid safety net.`
      });
    }

    if (userData.monthlyInvestments < health.savings * 0.5) {
      list.push({
        type: 'warning', icon: Lightbulb,
        title: 'Idle Cash Alert',
        desc: `You are investing only ${((userData.monthlyInvestments / health.savings) * 100).toFixed(0)}% of your savings. Idle cash loses value to inflation. Consider increasing your SIPs.`
      });
    }

    if (userData.targetRetirementAge - userData.currentAge < 10 && userData.currentNetWorth < 10000000) {
      list.push({
        type: 'danger', icon: TrendingUp,
        title: 'Retirement Horizon Risk',
        desc: `You have less than 10 years to target retirement. Aggressive portfolio rebalancing and higher contribution rates are strongly recommended.`
      });
    } else if (userData.expectedReturnRate < 10) {
       list.push({
        type: 'info', icon: Target,
        title: 'Conservative Growth',
        desc: `Your expected return is ${userData.expectedReturnRate}%. Ensure your portfolio has enough equity exposure to beat long-term inflation.`
      });
    }
    
    return list;
  }, [userData, health]);

  const styles = {
    danger: 'bg-rose-50 border-rose-200 text-rose-800 icon-rose-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-amber-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald-600',
    info: 'bg-blue-50 border-blue-200 text-blue-800 icon-blue-600',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="text-amber-500" /> AI Insights
        </h1>
        <p className="text-slate-500 text-sm mt-1">Personalized actionable advice based on your current financial model.</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className={`p-4 sm:p-6 rounded-2xl border ${styles[insight.type].split(' ').slice(0, 3).join(' ')} flex flex-col sm:flex-row items-start gap-3 sm:gap-4 shadow-sm`}>
            <div className={`sm:mt-1 shrink-0 ${styles[insight.type].split(' ')[3].replace('icon-', 'text-')}`}>
              <insight.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-1">{insight.title}</h3>
              <p className="opacity-90 leading-relaxed text-sm">{insight.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimulationPage = () => {
  const { userData } = useAppContext();
  
  // Scenario A: Current Path
  const fireCurrent = calculateFIRE(userData);
  
  // Scenario B: Improved Path (+20% SIP, +2% return via better asset allocation)
  const improvedData = {
    ...userData,
    monthlyInvestments: userData.monthlyInvestments * 1.2,
    expectedReturnRate: userData.expectedReturnRate + 2,
  };
  const fireImproved = calculateFIRE(improvedData);

  // Merge data for Recharts
  const mergedData = fireCurrent.chartData.map((d, index) => ({
    age: d.age,
    currentPath: d.corpus,
    improvedPath: fireImproved.chartData[index]?.corpus || 0
  }));

  const difference = fireImproved.totalCorpus - fireCurrent.totalCorpus;

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Future Simulation</h1>
        <p className="text-slate-500 text-sm mt-1">Compare your current trajectory against an optimized scenario.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card className="border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Current Trajectory</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 break-all">{formatCurrency(fireCurrent.totalCorpus)}</h2>
          <p className="text-xs text-slate-400 mt-2">SIP: {formatCurrency(userData.monthlyInvestments)} @ {userData.expectedReturnRate}%</p>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/30">
          <p className="text-emerald-700 text-sm font-medium flex items-center">
            <Sparkles size={16} className="mr-1 shrink-0" /> Optimized Trajectory
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1 break-all">{formatCurrency(fireImproved.totalCorpus)}</h2>
          <p className="text-xs text-emerald-600 mt-2">SIP: {formatCurrency(improvedData.monthlyInvestments)} @ {improvedData.expectedReturnRate}%</p>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none text-center py-6 sm:py-8 shadow-lg shadow-emerald-500/20">
        <p className="text-emerald-50 text-sm">Potential Wealth Unlocked</p>
        <h3 className="text-3xl sm:text-4xl font-extrabold mt-1 break-all">+{formatCurrency(difference)}</h3>
        <p className="text-emerald-100 text-xs sm:text-sm mt-3 sm:mt-4 max-w-xl mx-auto px-2">By increasing your SIP by 20% and optimizing your portfolio for a 2% higher return, you could unlock massive compound growth.</p>
      </Card>

      <Card className="flex flex-col min-w-0">
        <h3 className="font-bold text-slate-900 mb-4 sm:mb-6">Trajectory Comparison</h3>
        <div className="h-72 sm:h-96 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="age" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
              <YAxis 
                tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} 
                tick={{fill: '#64748b', fontSize: 12}} 
                tickLine={false} 
                axisLine={false}
                width={55}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name === 'improvedPath' ? 'Optimized' : 'Current']}
                labelFormatter={(label) => `Age: ${label}`}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="improvedPath" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorImproved)" />
              <Area type="monotone" dataKey="currentPath" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCurrent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const PortfolioPage = () => {
  const { userData } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pro Portfolio</h1>
        <p className="text-slate-500 text-sm mt-1">Advanced asset allocation and automated rebalancing insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px]">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-6 w-full text-left">Current Allocation</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={userData.portfolio}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {userData.portfolio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Allocation']}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card className="bg-slate-900 text-white border-none">
            <h3 className="font-bold flex items-center gap-2 mb-3 sm:mb-4 text-base sm:text-lg"><Zap className="text-amber-400 shrink-0" size={20}/> AI Rebalancing Alert</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Your <strong className="text-white">Indian Equity</strong> exposure is currently at {userData.portfolio[0].value}%. Based on your age ({userData.currentAge}) and target retirement ({userData.targetRetirementAge}), our model suggests reducing this to 55% and increasing <strong className="text-white">Global Equity</strong> to 20% to mitigate geographical risk.
            </p>
            <Button variant="secondary" className="w-full">Auto-Rebalance Portfolio</Button>
          </Card>

          <Card>
            <h3 className="font-bold text-slate-900 mb-3 sm:mb-4">Asset Performance (YTD)</h3>
            <div className="space-y-3">
              {userData.portfolio.map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: asset.color}} />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">{asset.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">+{((idx+1)*3.2).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AIAdvisorPage = () => {
  const { userData } = useAppContext();
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${userData.name.split(' ')[0]}! I'm your SmartMoney AI Advisor. I've been monitoring your portfolio of ${formatCurrency(userData.currentNetWorth)}. How can I help you optimize your wealth today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if(!input.trim()) return;

    const newMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      let reply = "I'm analyzing that right now...";
      const query = newMsg.text.toLowerCase();
      
      if(query.includes('tax')) {
        reply = "Based on your income, maximizing your Section 80C limit (₹1.5L) via ELSS funds can save you up to ₹46,800 in taxes. Would you like me to allocate your next SIP towards ELSS?";
      } else if(query.includes('retire') || query.includes('fire')) {
        reply = `You're aiming to retire at ${userData.targetRetirementAge}. If you increase your monthly SIP by just ₹5,000, you could hit your target 2 years earlier! Check the 'Future Sim' tab to visualize this.`;
      } else if (query.includes('market') || query.includes('crash')) {
        reply = "Markets are currently volatile, but your asset allocation is defensive enough. Based on historical data, I recommend maintaining your current SIPs. Don't try to time the market.";
      } else {
        reply = "That's an excellent question. I'm looking at your financial breakdown. To give you the most accurate answer, I recommend reviewing the 'Smart Insights' tab where I've detailed immediate action items for your portfolio.";
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">
      <div className="mb-4 sm:mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="text-emerald-500" /> AI Wealth Advisor
        </h1>
        <p className="text-slate-500 text-sm mt-1">Chat directly with our quantitative financial model for bespoke advice.</p>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-slate-200">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 sm:gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md' : 'bg-slate-800 text-white shadow-md'}`}>
                {msg.role === 'ai' ? <Sparkles size={14}/> : <User size={14}/>}
              </div>
              <div className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${msg.role === 'ai' ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none' : 'bg-slate-900 border-slate-800 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3 sm:gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 text-white shadow-md">
                  <Sparkles size={14}/>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-none flex items-center gap-1.5 h-[44px]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
             </div>
          )}
        </div>
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about taxes or retirement..."
              className="w-full pl-4 pr-14 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const { userData, updateUserData } = useAppContext();
  const [formData, setFormData] = useState(userData);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: isNaN(value) ? value : Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserData(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Profile & Financials</h1>
        <p className="text-slate-500 text-sm mt-1">Update your details to keep calculations accurate.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
            <Input label="Current Age" name="currentAge" type="number" value={formData.currentAge} onChange={handleChange} />
            <Input label="Retirement Age" name="targetRetirementAge" type="number" value={formData.targetRetirementAge} onChange={handleChange} />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mt-6 sm:mt-8">Financial Baseline (₹)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Monthly Income" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} />
            <Input label="Monthly Expenses" name="monthlyExpenses" type="number" value={formData.monthlyExpenses} onChange={handleChange} />
            <Input label="Monthly SIPs/Investments" name="monthlyInvestments" type="number" value={formData.monthlyInvestments} onChange={handleChange} />
            <Input label="Current Net Worth" name="currentNetWorth" type="number" value={formData.currentNetWorth} onChange={handleChange} />
          </div>

          <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {saved ? (
              <span className="text-emerald-600 flex items-center text-sm font-medium"><CheckCircle2 className="mr-2" size={16}/> Saved Successfully</span>
            ) : <span className="hidden sm:block" />}
            <Button variant="primary" type="submit" className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

// --- ROUTER / ROOT APP ---

const AppRouter = () => {
  const { currentRoute, user } = useAppContext();

  if (!user && currentRoute !== 'landing' && currentRoute !== 'login' && currentRoute !== 'signup') {
    return <LandingPage />;
  }

  switch (currentRoute) {
    case 'landing': return <LandingPage />;
    case 'login': return <AuthPage mode="login" />;
    case 'signup': return <AuthPage mode="signup" />;
    case 'dashboard': return <DashboardLayout><DashboardHome /></DashboardLayout>;
    case 'portfolio': return <DashboardLayout><PortfolioPage /></DashboardLayout>;
    case 'advisor': return <DashboardLayout><AIAdvisorPage /></DashboardLayout>;
    case 'money-score': return <DashboardLayout><MoneyScore /></DashboardLayout>;
    case 'planner': return <DashboardLayout><FIREPlanner /></DashboardLayout>;
    case 'insights': return <DashboardLayout><InsightsPage /></DashboardLayout>;
    case 'simulation': return <DashboardLayout><SimulationPage /></DashboardLayout>;
    case 'profile': return <DashboardLayout><ProfilePage /></DashboardLayout>;
    default: return <LandingPage />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}