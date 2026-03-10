import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  variant?: "default" | "overlay" | "detail";
}

const CountdownTimer = ({ targetDate, variant = "default" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const total = new Date(targetDate).getTime() - new Date().getTime();

  if (total <= 0) {
    return (
      <div className={variant === "overlay" ? "rounded-lg bg-foreground/60 backdrop-blur-sm px-3 py-1.5" : "mt-3"}>
        <p className="text-xs font-medium font-sans text-muted-foreground">
          {variant === "overlay" ? <span className="text-primary-foreground">Event has started</span> : "Event has started"}
        </p>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-foreground/60 backdrop-blur-sm px-3 py-1.5">
        <Clock size={12} className="text-primary-foreground/80" />
        <p className="text-xs font-semibold font-sans text-primary-foreground">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </p>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="mt-4">
        <p className="text-xs font-medium font-sans text-muted-foreground mb-3">Event starts in</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Mins" },
            { value: timeLeft.seconds, label: "Secs" },
          ].map((item) => (
            <div key={item.label} className="text-center rounded-xl bg-background p-3 border border-border/50">
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="countdown-bar"
            style={{ width: `${Math.max(0, Math.min(1, total / (30 * 24 * 60 * 60 * 1000))) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="countdown-bar-glow mt-3">
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-primary" />
        <p className="text-xs font-semibold font-sans text-foreground">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </p>
      </div>
    </div>
  );
};

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default CountdownTimer;
