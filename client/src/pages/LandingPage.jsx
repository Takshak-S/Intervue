import { useNavigate } from "react-router-dom";
import { 
  BsMicFill, 
  BsCodeSlash, 
  BsBarChartFill, 
  BsShieldCheck, 
  BsArrowRight,
  BsPlayFill,
  BsCheckCircleFill,
  BsCameraVideo
} from "react-icons/bs";

function LandingPage() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#0a0f1e] text-slate-200 font-sans selection:bg-primary/30 min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-xl border border-primary/30">
               <BsCameraVideo className="text-[20px] text-primary" />
            </div>
            <span className="font-serif text-2xl font-bold text-white tracking-tight">Intervue</span>
          </div>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-sans text-sm font-black rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/10 blur-[120px] rounded-full -ml-12 -mb-12 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <h1 className="font-serif text-5xl md:text-8xl text-white m-0 max-w-5xl tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Ace your next <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic">Technical interview</span>
          </h1>
          
          <p className="font-sans text-lg md:text-2xl text-slate-400 mt-8 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Practice with a realistic AI interviewer that speaks, listens, and evaluates your code in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <button 
              onClick={() => navigate("/login")}
              className="px-12 py-6 bg-primary text-white font-sans text-xl font-black rounded-2xl shadow-2xl shadow-primary/40 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Start practicing free
              <BsArrowRight className="text-[20px]" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="px-10 py-5 bg-transparent text-white border-2 border-white/10 font-sans text-lg font-bold rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-3"
            >
              <BsPlayFill className="text-[20px]" />
              See how it works
            </button>
          </div>

          {/* Hero Mockup Visual */}
          <div className="mt-24 w-full max-w-5xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
             <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full transform scale-90 opacity-20 pointer-events-none" />
             <div className="relative rounded-[2.5rem] border border-white/10 p-2 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
                <img 
                   src="/ui_mockup.png" 
                   alt="Intervue Dashboard Mockup" 
                   className="w-full h-auto rounded-[2rem] border border-white/10"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">Built for modern developers</h2>
            <p className="font-sans text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to master the interview process in one seamless, AI-powered environment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.07] transition-all group">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/30 group-hover:scale-110 transition-transform">
                <BsMicFill className="text-[20px] text-primary" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">Voice conversations</h3>
              <p className="font-sans text-slate-400 leading-relaxed">
                Our AI interviewer speaks and listens to you in real time. Practice articulating your thoughts clearly just like a real technical round.
              </p>
            </div>
            
            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.07] transition-all group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 group-hover:scale-110 transition-transform">
                <BsCodeSlash className="text-[20px] text-blue-500" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">Interactive IDE</h3>
              <p className="font-sans text-slate-400 leading-relaxed text-slate-400">
                Solve coding challenges in a built-in editor. Get real-time feedback on your logic, complexity, and coding style as you type.
              </p>
            </div>
            
            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.07] transition-all group">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <BsBarChartFill className="text-[20px] text-emerald-500" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-4">Instant scoring</h3>
              <p className="font-sans text-slate-400 leading-relaxed text-slate-400">
                Receive a detailed match score and personalized feedback immediately after your session. Identify your gaps and focus where it matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-6xl text-white mb-12 leading-tight">Master the process <br />in 3 simple steps</h2>
              <div className="space-y-12">
                <div className="flex gap-8">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center font-serif text-xl text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-serif text-xl text-white mb-2">Choose your role</h4>
                    <p className="font-sans text-slate-400">Select from Frontend, Full Stack, DevOps, or Data Analyst roles to get personalized technical questions.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center font-serif text-xl text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-serif text-xl text-white mb-2">Engage with Natalie</h4>
                    <p className="font-sans text-slate-400">Answer voice-based questions or solve live coding challenges in our interactive environment.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center font-serif text-xl text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-serif text-xl text-white mb-2">Get your feedback</h4>
                    <p className="font-sans text-slate-400">Receive an instant score out of 100 with category-wise breakdowns for your performance.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full transform scale-75 opacity-50 pointer-events-none" />
               <div className="relative bg-[#1e2536] border border-white/10 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                  <div className="text-center">
                     <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BsCameraVideo className="text-[20px] text-primary" />
                     </div>
                     <span className="font-sans text-sm font-black uppercase tracking-[0.3em] text-primary">Live interview mode</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="font-serif text-5xl md:text-7xl text-white mb-8 tracking-tight">Ready to land <br />your dream job?</h2>
          <p className="font-sans text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Stop worrying about the technical rounds. Start practicing with Intervue today and build your confidence.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="px-12 py-6 bg-primary text-white font-sans text-xl font-black rounded-2xl shadow-3xl shadow-primary/50 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
          >
            Start free interview
            <BsArrowRight className="text-[20px]" />
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
         <p className="font-sans text-sm text-slate-500 uppercase tracking-widest font-black">© 2026 Intervue AI • All rights reserved</p>
      </footer>
    </div>
  );
}

export default LandingPage;
