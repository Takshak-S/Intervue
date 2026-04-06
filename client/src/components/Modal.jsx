import { useEffect } from "react";
import { BsExclamationTriangle } from "react-icons/bs";

function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.classList.add("no-scroll");
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      btnClass: "bg-red-600 hover:bg-red-700 text-white",
      iconClass: "bg-red-100 text-red-600",
    },
    warning: {
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
      iconClass: "bg-amber-100 text-amber-600",
    },
    primary: {
      btnClass: "bg-primary hover:bg-primary-dark text-white",
      iconClass: "bg-blue-100 text-primary",
    }
  };

  const { btnClass, iconClass } = typeConfig[type] || typeConfig.primary;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
              <BsExclamationTriangle className="text-xl" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-slate-900 m-0">{title}</h3>
              <p className="font-sans text-sm text-slate-500 mt-1">{message}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-sans text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 font-sans text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 ${btnClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

export default Modal;
