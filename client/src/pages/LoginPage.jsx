import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { register, emailLogin } from "../services/authService.js";
import {
  BsCameraVideo,
  BsMicFill,
  BsFileEarmarkTextFill,
  BsCodeSlash,
  BsBarChartFill,
  BsShieldCheck,
  BsPeopleFill,
} from "react-icons/bs";
import toast from "react-hot-toast";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await register(name, email, password);
        toast.success("Account created successfully!");
      } else {
        result = await emailLogin(email, password);
        toast.success("Welcome back!");
      }

      login(result.token, result.user);
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="px-10 py-8 flex items-center justify-between relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 text-white">
          <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-xl border border-primary/30 backdrop-blur-md">
            <BsCameraVideo className="text-xl text-primary" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">
            Intervue
          </span>
        </div>
      </nav>

      <div className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center gap-8 z-10">
        <h1 className="font-serif text-5xl md:text-7xl text-white m-0 max-w-4xl tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
          Ace Your Next{" "}
          <span className="text-primary italic">Technical Interview</span>
        </h1>
        <p className="font-sans text-xl md:text-2xl text-slate-400 m-0 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Practice with an AI interviewer that speaks, listens, and gives you
          real-time feedback on your performance.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {[
            { icon: BsMicFill, text: "Voice Conversations" },
            { icon: BsFileEarmarkTextFill, text: "Resume Parser" },
            { icon: BsCodeSlash, text: "IDE Environment" },
            { icon: BsBarChartFill, text: "Scoring Engine" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-6 py-3 bg-slate-800/40 border border-slate-700/50 rounded-full text-slate-300 backdrop-blur-xl hover:bg-slate-800/60 transition-colors"
            >
              <item.icon className="text-primary" />
              <span className="font-sans text-sm font-bold tracking-wide uppercase">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center px-6 relative z-10 -mt-8 pb-32">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-10 md:p-12 border border-slate-100 flex flex-col gap-10 animate-in zoom-in-95 duration-1000 delay-300">
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
            <button
              className={`flex-1 py-4 font-sans text-sm font-black rounded-xl transition-all duration-300 ${!isSignUp ? "bg-white text-primary shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => setIsSignUp(false)}
            >
              SIGN IN
            </button>
            <button
              className={`flex-1 py-4 font-sans text-sm font-black rounded-xl transition-all duration-300 ${isSignUp ? "bg-white text-primary shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => setIsSignUp(true)}
            >
              JOIN FREE
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="font-sans text-xs font-black text-slate-400 uppercase tracking-widest pl-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="px-5 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all"
                  placeholder="e.g. John Wick"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-sans text-xs font-black text-slate-400 uppercase tracking-widest pl-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="px-5 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-sans text-xs font-black text-slate-400 uppercase tracking-widest pl-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="px-5 py-4 border-2 border-slate-50 bg-slate-50 rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-5 bg-primary text-white font-sans text-base font-black rounded-2xl shadow-2xl shadow-primary/40 hover:bg-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-50 disabled:cursor-wait`}
              disabled={loading}
            >
              {loading
                ? "PREPARING..."
                : isSignUp
                  ? "CREATE ACCOUNT"
                  : "SIGN INTO APP"}
            </button>
          </form>
        </div>

        <div className="flex flex-wrap justify-center gap-12 mt-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
          <div className="flex items-center gap-2.5 text-slate-400">
            <BsShieldCheck className="text-2xl" />
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
              Secure Platform
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <BsPeopleFill className="text-2xl" />
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
              Join 10,000+ users
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <BsBarChartFill className="text-2xl" />
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em]">
              Live Mentoring AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
