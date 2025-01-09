import { useState, useRef, useEffect } from "react";
import { useNotification } from "~/context/NotificationContext";

type ReportModalProps = {
  show: boolean;
  onClose: () => void;
  reportableId: number;
  reportableType: string;
  token: string;
};

const reasons = [
  "Inappropriate content",
  "Spam",
  "Harassment",
  "Other"
];

export default function ReportModal({ show, onClose, reportableId, reportableType, token }: ReportModalProps) {
  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState("");
  const { setNotification } = useNotification();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const handleSubmit = async () => {
    const response = await fetch(`http://localhost/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportable_id: reportableId,
        reportable_type: reportableType,
        reason,
        description,
      }),
    });

    if (response.ok) {
      setNotification({ message: "Report submitted successfully", type: "success" });
      onClose();
    } else {
      setNotification({ message: "Failed to submit report", type: "error" });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Report Content</h3>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {reasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 font-bold rounded-lg shadow-md transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}