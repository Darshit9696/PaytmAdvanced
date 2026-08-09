"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function DynamicTimerBanner() {
  const [mountedTime] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState("Just now");

  useEffect(() => {
    const renderTimeLabel = () => {
      const differenceSec = Math.floor((new Date().getTime() - mountedTime.getTime()) / 1000);
      const minutes = Math.floor(differenceSec / 60);

      if (minutes < 1) {
        setTimeAgo("Just now");
      } else if (minutes === 1) {
        setTimeAgo("Updated 1 min ago");
      } else {
        setTimeAgo(`Updated ${minutes} mins ago`);
      }
    };

    renderTimeLabel();
    const ticker = setInterval(renderTimeLabel, 60000);

    return () => clearInterval(ticker);
  }, [mountedTime]);

  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 text-cyan-200 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm select-none border border-white/5">
      <RefreshCw className="w-2.5 h-2.5 animate-pulse" />
      {timeAgo}
    </span>
  );
}