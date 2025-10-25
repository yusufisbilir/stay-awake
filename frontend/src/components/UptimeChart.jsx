/**
 * UptimeChart Component
 * Visualizes 7-day uptime status
 */

import { format } from "date-fns";
import { tr } from "date-fns/locale";

const UptimeChart = ({ history }) => {
  // Create last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Find status for each day
  const getDayStatus = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return history.find((h) => h.date === dateStr);
  };

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-2">Last 7 Days</p>
      <div className="flex gap-2">
        {last7Days.map((date, index) => {
          const status = getDayStatus(date);
          const dateFormatted = format(date, "d MMM", { locale: tr });

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
              title={
                status
                  ? `${dateFormatted} - ${
                      status.status === "success" ? "Success" : "Failed"
                    }${
                      status.responseTime ? ` (${status.responseTime}ms)` : ""
                    }`
                  : `${dateFormatted} - No data`
              }
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${
                  status
                    ? status.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-300"
                }`}
              >
                {status ? (status.status === "success" ? "✓" : "✗") : "○"}
              </div>
              <p className="text-xs text-gray-500 mt-1">{dateFormatted}</p>
              {status && status.responseTime && (
                <p className="text-xs text-gray-400">{status.responseTime}ms</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UptimeChart;
