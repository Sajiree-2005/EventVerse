import { EVENT_CATEGORIES } from "@/data/events";
import { Search, X } from "lucide-react";

interface EventFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Technology: "💻",
  Cultural: "🎭",
  Sports: "⚽",
  Academic: "📚",
  Workshop: "🔧",
  Hackathon: "🚀",
  Seminar: "🎤",
  Social: "🎉",
};

const EventFilters = ({ search, onSearchChange, category, onCategoryChange }: EventFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search events by name or description…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="glass-input pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange("")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
            !category
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
              : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          All Events
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === category ? "" : cat)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
              category === cat
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || "📌"}</span>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventFilters;
