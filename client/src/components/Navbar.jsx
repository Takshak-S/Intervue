import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { BsCameraVideo } from "react-icons/bs";
import { MdDashboard, MdHistory, MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeLinkClass = "bg-primary/20 text-primary border border-primary/20";
  const inactiveLinkClass = "text-slate-400 hover:text-white hover:bg-white/5";

  return (
    <nav className="flex items-center justify-between bg-[#0a0f1e] px-8 h-20 border-b border-white/5 z-50">
      <div className="flex items-center gap-12">
        <Link to="/dashboard" className="flex items-center gap-3 no-underline group">
           <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-xl border border-primary/30 group-hover:bg-primary/30 transition-all">
              <BsCameraVideo className="text-[20px] text-primary" />
           </div>
           <span className="font-serif text-2xl font-bold text-white tracking-tight">
             Intervue
           </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 no-underline font-sans text-sm font-bold px-4 py-2.5 rounded-xl transition-all ${location.pathname === "/dashboard" ? activeLinkClass : inactiveLinkClass}`}
          >
            <MdDashboard className="text-[18px]" />
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-2 no-underline font-sans text-sm font-bold px-4 py-2.5 rounded-xl transition-all ${location.pathname === "/history" ? activeLinkClass : inactiveLinkClass}`}
          >
            <MdHistory className="text-[18px]" />
            History
          </Link>
        </div>
      </div>
      <div className="flex items-center">
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                 <FaUser className="text-primary text-xs" />
              </div>
              <span className="font-sans text-sm text-slate-200 font-bold">
                {user.name}
              </span>
            </div>
            <button
              className="flex items-center gap-2 font-sans text-sm font-bold text-red-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all"
              onClick={handleLogout}
            >
              <MdLogout className="text-[18px]" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
