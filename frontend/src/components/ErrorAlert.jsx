import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorAlert = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-800">Analysis Error</h3>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
