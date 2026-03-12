import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import { ArrowRight, Sparkles, Calendar, Users, Tag, Star, TrendingUp } from "lucide-react";
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

  const featuredEvent = events[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.05s", opacity: 0 }}
            >
              <Sparkles size={11} />
              Your Campus Event Hub
            </div>

            {/* Headline */}
            <h1
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in-up"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            >
              Discover & Register for{" "}
              <span className="relative inline-block">
                <span className="text-primary">Campus Events</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full" />
              </span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-xl text-lg font-serif text-muted-foreground leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.2s", opacity: 0 }}
            >
              From hackathons to cultural fests — find events that match your passion, register in seconds, and make the most of your campus life.
            </p>

            {/* CTAs */}
            <div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in-up"
              style={{ animationDelay: "0.3s", opacity: 0 }}
            >
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground btn-primary-brighten shadow-lg shadow-primary/25"
              >
                Explore Events
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/student/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Student Portal
              </Link>
            </div>

            {/* Stats */}
            <div
              className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s", opacity: 0 }}
            >
              {[
                { icon: Calendar, label: "Events", value: events.length, suffix: "+" },
                { icon: Users, label: "Registrations", value: registrations.length },
                { icon: Tag, label: "Categories", value: new Set(events.map((e) => e.category)).size },
              ].map((stat) => (
                <div key={stat.label} className="relative text-center group">
                  <div className="flex h-10 w-10 mx-auto mb-3 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <stat.icon size={18} className="text-primary" />
                  </div>
                  <p className="text-2xl font-extrabold text-foreground tabular-nums">
                    {stat.value}{stat.suffix || ""}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Event Banner */}
      {featuredEvent && (
        <section className="border-y border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  <Star size={11} className="fill-current" />
                  Featured
                </div>
                <TrendingUp size={14} className="text-muted-foreground" />
              </div>
              <img
                src={featuredEvent.poster}
                alt=""
                className="h-10 w-14 rounded-lg object-cover shrink-0 hidden sm:block"
              />
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="text-sm font-bold text-foreground truncate">{featuredEvent.name}</p>
                <p className="text-xs text-muted-foreground font-sans">
                  {new Date(featuredEvent.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {featuredEvent.venue}
                </p>
              </div>
              <Link
                to={`/events/${featuredEvent.id}`}
                className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
              >
                Register Now →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Upcoming Events</h2>
            <p className="mt-1 text-sm font-serif text-muted-foreground">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-primary hover:underline underline-offset-2 self-start sm:self-auto"
          >
            View all →
          </Link>
        </div>

        <EventFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 6).map((event, i) => (
            <div
              key={event.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Calendar size={24} className="text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No events found</p>
            <p className="mt-1 text-sm font-serif text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
