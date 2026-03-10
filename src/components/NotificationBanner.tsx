import { useApp } from "@/context/AppContext";
import { X, Flame } from "lucide-react";

const NotificationBanner = () => {
  const { notificationBanner, dismissBanner } = useApp();
  if (!notificationBanner) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Flame size={14} className="animate-pulse-soft" />
          <p className="text-sm font-medium font-sans">{notificationBanner}</p>
        </div>
        <button onClick={dismissBanner} className="ml-4 shrink-0 rounded-lg p-1.5 transition-all hover:bg-primary-foreground/10">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
