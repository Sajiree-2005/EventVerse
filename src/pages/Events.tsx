import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import { Calendar, SlidersHorizontal } from "lucide-react";

const Events = () => {
  const { events } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || e.category === category;
      return matchSearch && matchCategory;
    });
  }, [events, search, category]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Calendar size={16} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">All Events</h1>
        </div>
        <p className="text-sm font-serif text-muted-foreground ml-11">
          Showing {filtered.length} of {events.length} events
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 p-5 rounded-2xl border border-border/50 bg-card/60">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter Events</span>
        </div>
        <EventFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event, i) => (
          <div
            key={event.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Calendar size={24} className="text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground">No events match your criteria</p>
          <p className="mt-1.5 text-sm font-serif text-muted-foreground">
            Try a different search term or category filter
          </p>
          <button
            onClick={() => { setSearch(""); setCategory(""); }}
            className="mt-5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;
