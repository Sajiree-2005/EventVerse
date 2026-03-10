import { EVENT_CATEGORIES } from "@/data/events";
import { Search } from "lucide-react";

interface EventFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
}

const EventFilters = ({ search, onSearchChange, category, onCategoryChange }: EventFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="glass-input pl-11"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange("")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
            !category
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
          }`}
        >
          All Events
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === category ? "" : cat)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              category === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventFilters;
