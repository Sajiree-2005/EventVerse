import { Event } from "@/data/events";
import CountdownTimer from "./CountdownTimer";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, ArrowRight, Zap } from "lucide-react";

interface EventCardProps {
  event: Event;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-500/15 text-blue-700 border-blue-200",
  Cultural: "bg-orange-500/15 text-orange-700 border-orange-200",
  Sports: "bg-green-500/15 text-green-700 border-green-200",
  Academic: "bg-purple-500/15 text-purple-700 border-purple-200",
  Workshop: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  Hackathon: "bg-primary/15 text-primary border-primary/20",
  Seminar: "bg-teal-500/15 text-teal-700 border-teal-200",
  Social: "bg-pink-500/15 text-pink-700 border-pink-200",
};

const EventCard = ({ event }: EventCardProps) => {
  const seatsLeft = event.capacity - event.registered;
  const capacityPercent = (event.registered / event.capacity) * 100;
  const isFull = seatsLeft <= 0;
  const isAlmostFull = seatsLeft <= 10 && seatsLeft > 0;
  const categoryColor = CATEGORY_COLORS[event.category] || "bg-primary/10 text-primary border-primary/20";

  const barColor = isFull
    ? "bg-destructive"
    : isAlmostFull
    ? "bg-amber-500"
    : "bg-primary";

  return (
    <div className="card-elevated group overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.poster}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm bg-white/90 ${categoryColor}`}>
            {event.category}
          </span>
          {isAlmostFull && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lg">
              <Zap size={9} className="fill-white" />
              Hot
            </span>
          )}
          {isFull && (
            <span className="inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lg">
              Full
            </span>
          )}
        </div>

        {/* Countdown overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <CountdownTimer targetDate={event.date} variant="overlay" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-extrabold leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {event.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm font-serif text-muted-foreground leading-relaxed">
          {event.description}
        </p>

        {/* Meta */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
              <Calendar size={11} className="text-primary" />
            </div>
            <span className="font-sans text-xs">
              {new Date(event.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
              <MapPin size={11} className="text-primary" />
            </div>
            <span className="font-sans text-xs truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-muted-foreground" />
              <span className={`text-xs font-semibold ${isFull ? "text-destructive" : isAlmostFull ? "text-amber-600" : "text-foreground"}`}>
                {isFull ? "Event Full" : `${seatsLeft} seats left`}
              </span>
            </div>
            <span className="text-[11px] font-sans tabular-nums text-muted-foreground">
              {event.registered}/{event.capacity}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/events/${event.id}`}
          className={`mt-5 flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
            isFull
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground btn-primary-brighten group/btn"
          }`}
        >
          {isFull ? "View Details" : "Register Now"}
          <ArrowRight
            size={14}
            className={`transition-transform duration-200 ${!isFull ? "group-hover/btn:translate-x-1" : ""}`}
          />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
