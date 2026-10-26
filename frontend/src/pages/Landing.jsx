import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, FileText, Compass, Briefcase, TrendingUp, ArrowRight, Menu, X,
  CheckCircle2, Target, Brain, LineChart, Users, ShieldCheck, Zap, Award,
  Code, Database, BarChart3, UserCheck, Map,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Resume Analyzer", href: "#resume-analysis" },
  { label: "Career Guidance", href: "#career-guidance" },
  { label: "Performance Predictor", href: "#performance" },
  { label: "About", href: "#about" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">CareerAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:inline-flex btn-ghost">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
          <button onClick={() => setOpen((o) => !o)} className="btn-ghost !p-2 md:hidden" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 bg-white dark:bg-slate-950">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-200/40 dark:bg-brand-500/10 rounded-full blur-3xl -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in-up">
          <span className="badge badge-brand mb-4">
            <Brain className="w-3.5 h-3.5" /> AI-Powered Career Intelligence
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Build Your Career <br /> with <span className="text-brand-600">AI</span>
          </h1>
          <p className="mt-5 text-lg muted max-w-xl">
            Analyze your resume, discover skill gaps, find suitable career paths, and predict academic performance using AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-5 py-3 text-base">
              Analyze My Resume <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="btn-secondary px-5 py-3 text-base">
              Explore Careers
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm muted">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> NLP resume parsing</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ML performance prediction</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Skill-gap analysis</span>
          </div>
        </div>

        <div className="relative animate-fade-in-up [animation-delay:120ms]">
          <div className="card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm muted">Resume Analysis</p>
              <Badge tone="green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live</Badge>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-brand-50 dark:bg-brand-500/10 grid place-items-center text-brand-600 dark:text-brand-300">
                <span className="text-3xl font-bold">78</span>
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between text-sm"><span className="muted">Resume Score</span><span className="font-semibold">78/100</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "78%" }} /></div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Java", "MySQL", "React", "Git"].map((s) => (
                    <span key={s} className="badge badge-brand">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">12</p>
                <p className="text-[11px] muted">Skills</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">82%</p>
                <p className="text-[11px] muted">Job Match</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-lg font-bold text-emerald-600">Low</p>
                <p className="text-[11px] muted">Risk</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 card px-4 py-3 shadow-soft animate-float hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 grid place-items-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs muted">Career Readiness</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">80%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = { brand: "badge-brand", green: "badge-green", amber: "badge-amber", slate: "badge-slate" };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

const FEATURES = [
  { icon: FileText, title: "AI Resume Analysis", desc: "Upload a PDF or DOCX and get skills, projects, experience, certifications and a transparency-scored resume score in seconds.", tone: "brand" },
  { icon: Compass, title: "Career Skill Guidance", desc: "Choose a target career and see exactly which skills you have and which you still need to become job-ready.", tone: "violet" },
  { icon: Briefcase, title: "Job Recommendations", desc: "Get ranked career roles with match percentages, required skills and the reasoning behind each recommendation.", tone: "amber" },
  { icon: TrendingUp, title: "Performance Prediction", desc: "A trained scikit-learn model predicts student performance and risk level from attendance, marks and study habits.", tone: "green" },
];

function Features() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Everything you need to grow your career</h2>
          <p className="mt-3 muted">Four AI-powered modules working together in one platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} id={f.id} className="card p-6 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-12 h-12 rounded-xl grid place-items-center mb-4 ${
                f.tone === "brand" ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                : f.tone === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                : f.tone === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
              <p className="mt-2 text-sm muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Create your account", desc: "Register securely with hashed passwords and JWT authentication." },
  { n: "02", title: "Upload your resume", desc: "Our NLP engine extracts skills, projects, experience and certifications." },
  { n: "03", title: "Pick a target career", desc: "See your skill gaps, career readiness and a personalized roadmap." },
  { n: "04", title: "Predict & plan", desc: "Estimate academic performance risk and follow your learning roadmap." },
];

function HowItWorks() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">How it works</h2>
          <p className="mt-3 muted">From resume to roadmap in four simple steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6 relative">
              <span className="text-3xl font-extrabold text-brand-200 dark:text-brand-500/30">{s.n}</span>
              <h3 className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{s.title}</h3>
              <p className="mt-1.5 text-sm muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CATEGORIES = [
  { icon: Code, label: "Technical", roles: "Java, Full-Stack, Frontend, Backend", tone: "brand" },
  { icon: BarChart3, label: "Data", roles: "Data Analyst, Data Scientist, ML Engineer", tone: "violet" },
  { icon: Users, label: "Business", roles: "Sales, Technical Sales, Business Dev", tone: "amber" },
];

function CareerCategories() {
  return (
    <section id="career-guidance" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">What do you want to become?</h2>
          <p className="mt-3 muted">Explore career categories with curated required-skill sets.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="card p-6 card-hover">
              <div className={`w-12 h-12 rounded-xl grid place-items-center mb-4 ${
                c.tone === "brand" ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                : c.tone === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
              }`}>
                <c.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{c.label}</h3>
              <p className="mt-1.5 text-sm muted">{c.roles}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: Target, title: "Skill Gap Analysis", desc: "Transparent matched/missing skill breakdown with a documented readiness formula." },
  { icon: Map, title: "Learning Roadmap", desc: "Staged beginner-to-job-ready roadmap with progress tracking saved to your account." },
  { icon: Brain, title: "NLP Resume Engine", desc: "Deterministic skill extraction with no random scores — built on a curated skill knowledge base." },
  { icon: LineChart, title: "ML Predictions", desc: "Multiple models trained and evaluated; the best one is selected automatically." },
  { icon: ShieldCheck, title: "Secure by Design", desc: "Password hashing, JWT auth, file validation and parameterized queries throughout." },
  { icon: Award, title: "Demo Ready", desc: "A demo account lets you walk through the full flow instantly for presentations." },
];

function Benefits() {
  return (
    <section id="performance" className="py-16 lg:py-24 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Key features</h2>
          <p className="mt-3 muted">Built for students, designed like a modern analytics platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-6 card-hover">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 grid place-items-center shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{b.title}</h3>
                  <p className="mt-1 text-sm muted">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="card p-10 lg:p-14 text-center bg-gradient-to-br from-brand-600 to-brand-800 border-0 text-white">
          <Zap className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold">Start your career journey today</h2>
          <p className="mt-3 text-brand-100 max-w-xl mx-auto">Create a free account and let AI guide your resume, skills and academic performance.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50 px-5 py-3 text-base">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/login" className="btn border border-white/40 text-white hover:bg-white/10 px-5 py-3 text-base">Login</Link>
          </div>
          <p className="mt-5 text-xs text-brand-200">Demo account: demo@careerguidance.ai / demo1234</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white"><Sparkles className="w-4 h-4" /></div>
            <span className="font-bold text-slate-800 dark:text-slate-100">CareerAI</span>
          </div>
          <p className="text-sm muted">AI-Powered Career Guidance, Resume Analyzer & Student Performance Prediction System.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Platform</p>
          <ul className="space-y-2 text-sm muted">
            <li><a href="#resume-analysis" className="hover:text-brand-600">Resume Analyzer</a></li>
            <li><a href="#career-guidance" className="hover:text-brand-600">Career Guidance</a></li>
            <li><a href="#performance" className="hover:text-brand-600">Performance Predictor</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Account</p>
          <ul className="space-y-2 text-sm muted">
            <li><Link to="/login" className="hover:text-brand-600">Login</Link></li>
            <li><Link to="/register" className="hover:text-brand-600">Register</Link></li>
            <li><Link to="/app" className="hover:text-brand-600">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Tech Stack</p>
          <ul className="space-y-2 text-sm muted">
            <li>React · Vite · Tailwind</li>
            <li>FastAPI · SQLAlchemy · MySQL</li>
            <li>scikit-learn · NLP</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs muted">© {new Date().getFullYear()} CareerAI. Built as a B.Tech Major Project.</p>
          <p className="text-xs muted">Designed for demonstration & educational use.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Nav />
      <main>
        <Hero />
        <div id="resume-analysis" />
        <Features />
        <HowItWorks />
        <CareerCategories />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
