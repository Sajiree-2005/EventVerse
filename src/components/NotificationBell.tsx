import { useEffect, useState, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllRead } from "@/services/api";

interface Props {
  email: string;
}

const NotificationBell = ({ email }: Props) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await getNotifications(email);
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    if (email) {
      load();
      const interval = setInterval(load, 30000); // poll every 30s
      return () => clearInterval(interval);
    }
  }, [email]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRead = async (id: number) => {
    await markNotificationRead({ notificationId: id, studentEmail: email });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleAllRead = async () => {
    await markAllRead(email);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const typeIcon: Record<string, string> = {
    registration_confirm: "✅",
    team_registration: "🏆",
    volunteer_confirm: "🙌",
    volunteer_cancel: "❌",
    cancellation: "🚫",
    reminder: "⏰",
    followup: "⭐",
    feedback_submitted: "⭐",
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-card border border-border shadow-[var(--modal-shadow)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-sm font-extrabold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={handleAllRead} className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground font-serif">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => !n.isRead && handleRead(n.id)}
                  className={`px-4 py-3 border-b border-border/30 last:border-0 cursor-pointer transition-colors
                    ${n.isRead ? "hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"}`}>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-base shrink-0 mt-0.5">{typeIcon[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                      <p className="text-[11px] text-muted-foreground font-serif leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border/50 px-4 py-2.5">
            <Link to="/dashboard?tab=notifications" onClick={() => setOpen(false)} className="text-xs font-bold text-primary hover:underline">
              View all in Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
