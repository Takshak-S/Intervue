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

  const activeLinkClass = "bg-blue-100 text-blue-700";
  const inactiveLinkClass = "text-slate-200 hover:bg-slate-800";

  return (
    <nav className="flex items-center justify-between bg-slate-900 px-6 h-[60px] shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 no-underline group">
          <BsCameraVideo className="text-white text-2xl group-hover:text-primary transition-colors" />
          <span className="font-serif text-lg text-white">
            AI Mock Interview
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 no-underline font-sans text-sm px-3.5 py-2 rounded-md transition-colors ${location.pathname === "/" ? activeLinkClass : inactiveLinkClass}`}
          >
            <MdDashboard className="text-lg" />
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1.5 no-underline font-sans text-sm px-3.5 py-2 rounded-md transition-colors ${location.pathname === "/history" ? activeLinkClass : inactiveLinkClass}`}
          >
            <MdHistory className="text-lg" />
            History
          </Link>
        </div>
      </div>
      <div className="flex items-center">
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
              <FaUser className="text-white text-xs" />
              <span className="font-sans text-sm text-white font-medium">
                {user.name}
              </span>
            </div>
            <button
              className="flex items-center gap-1 font-sans text-sm text-red-500 hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
              onClick={handleLogout}
            >
              <MdLogout className="text-base" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
