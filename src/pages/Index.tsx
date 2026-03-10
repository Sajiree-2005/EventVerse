import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import { ArrowRight, Sparkles, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { events, registrations } = useApp();
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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-card py-24 lg:py-32">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-fade-in-up" style={{ animationDelay: "0.05s", opacity: 0 }}>
              <Sparkles size={12} />
              Your Campus Event Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              Discover & Register for{" "}
              <span className="text-primary">Exciting Events</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg font-serif text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
              Your single destination for workshops, hackathons, cultural fests, and more. Find what excites you.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
              <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten">
                Explore Events <ArrowRight size={14} />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                My Dashboard
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            {[
              { icon: Calendar, label: "Events", value: events.length },
              { icon: Users, label: "Registrations", value: registrations.length },
              { icon: Sparkles, label: "Categories", value: new Set(events.map(e => e.category)).size },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon size={20} className="mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs font-sans text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
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
            <p className="text-lg font-medium text-muted-foreground">No events found</p>
            <p className="mt-1 text-sm font-serif text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
