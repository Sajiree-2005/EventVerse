import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";

const Events = () => {
  const { events } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || e.category === category;
      return matchSearch && matchCategory;
    });
  }, [events, search, category]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Events</h1>
        <p className="mt-1 text-sm font-serif text-muted-foreground">{filtered.length} events available</p>
      </div>

      <EventFilters search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event, i) => (
          <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No events match your criteria</p>
          <p className="mt-1 text-sm font-serif text-muted-foreground">Try a different search or category</p>
        </div>
      )}
    </div>
  );
};

export default Events;
