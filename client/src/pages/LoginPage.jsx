import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { register, emailLogin } from "../services/authService.js";
import {
  BsCameraVideo,
  BsMicFill,
  BsCodeSlash,
  BsBarChartFill,
  BsShieldCheck,
  BsArrowLeft,
  BsArrowRightShort,
  BsEye,
  BsEyeSlash
} from "react-icons/bs";
import toast from "react-hot-toast";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Header (Top Left Logo) */}
      <div className="absolute top-0 left-0 p-8 z-50">
        <Link to="/" className="flex items-center gap-3 no-underline group">
           <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-xl border border-primary/30">
              <BsCameraVideo className="text-[20px] text-primary" />
           </div>
           <span className="font-serif text-2xl font-bold text-white tracking-tight">Intervue</span>
        </Link>
      </div>

      {/* Header (Top Right Back Link) */}
      <div className="absolute top-0 right-0 p-8 z-50 hidden md:block">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest no-underline">
           <BsArrowLeft className="text-[20px]" />
           Back to home
        </Link>
      </div>

      {/* Left Side: Product Pitch */}
      <div className="flex-1 relative hidden md:flex flex-col justify-center px-24 py-32 overflow-hidden border-r border-white/5 bg-[#0a0f1e]/50">
         {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
           <h2 className="font-serif text-5xl text-white mb-6 leading-tight tracking-tight">
             Master your <span className="text-primary italic">dream job</span> interview today.
           </h2>
           <p className="font-sans text-xl text-slate-400 mb-12 leading-relaxed">
             Join 10,000+ developers practicing with Natalie, our AI interviewer. Get real-time feedback and clear gaps.
           </p>

           <div className="space-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                    <BsMicFill className="text-[20px] text-primary" />
                 </div>
                 <div>
                    <h4 className="font-serif text-xl text-white mb-1">Conversational AI</h4>
                    <p className="font-sans text-sm text-slate-500">Practice voice-based technical rounds with realistic dialogue flow.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                    <BsCodeSlash className="text-[20px] text-blue-400" />
                 </div>
                 <div>
                    <h4 className="font-serif text-xl text-white mb-1">Live code evaluation</h4>
                    <p className="font-sans text-sm text-slate-500">Solve challenges in our built-in IDE with instant AI grading.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <BsBarChartFill className="text-[20px] text-emerald-400" />
                 </div>
                 <div>
                    <h4 className="font-serif text-xl text-white mb-1">Detailed scoring</h4>
                    <p className="font-sans text-sm text-slate-500">Get a score out of 100 with category-wise match performance.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side: Auth Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] pt-16 pb-12 px-10 md:px-12 flex flex-col gap-6 animate-in zoom-in-95 duration-500 relative z-10">
          
          <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
            <button
              className={`flex-1 py-3.5 font-sans text-sm font-black rounded-xl transition-all duration-300 ${!isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign in
            </button>
            <button
              className={`flex-1 py-3.5 font-sans text-sm font-black rounded-xl transition-all duration-300 ${isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => setIsSignUp(true)}
            >
              Join free
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="font-sans text-[13px] font-bold text-slate-500 px-1">Full name</label>
                <input
                  id="name"
                  type="text"
                  className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-sans text-[13px] font-bold text-slate-500 px-1">Email address</label>
              <input
                id="email"
                type="email"
                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-sans text-[13px] font-bold text-slate-500 px-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3.5 pr-12 bg-slate-50 border-none rounded-2xl font-sans text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <BsEyeSlash className="text-[18px]" /> : <BsEye className="text-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-4.5 bg-primary text-white font-sans text-base font-black rounded-2xl shadow-3xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Processing..." : isSignUp ? "Create account" : "Sign into app"}
              {!loading && <BsArrowRightShort className="text-[20px]" />}
            </button>
          </form>
        </div>
        
        {/* Mobile footer links */}
        <div className="mt-8 flex items-center gap-6 font-sans text-xs font-bold text-slate-500 md:hidden">
           <Link to="/" className="hover:text-white no-underline transition-colors uppercase tracking-[0.2em]">Home</Link>
           <span className="opacity-20">•</span>
           <span className="uppercase tracking-[0.2em]">Contact</span>
           <span className="opacity-20">•</span>
           <span className="uppercase tracking-[0.2em]">Privacy</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
