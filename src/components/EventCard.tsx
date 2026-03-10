import { Event } from "@/data/events";
import CountdownTimer from "./CountdownTimer";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const seatsLeft = event.capacity - event.registered;
  const capacityPercent = (event.registered / event.capacity) * 100;

  return (
    <div className="card-elevated group overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.poster}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
            {event.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <CountdownTimer targetDate={event.date} variant="overlay" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-300">
          {event.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground font-serif leading-relaxed">
          {event.description}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar size={14} className="text-primary shrink-0" />
            <span className="font-sans">{new Date(event.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="font-sans">{event.venue}</span>
          </div>
        </div>

        {/* Capacity tracker */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-primary" />
              <span className="font-sans font-medium text-foreground">
                {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}
              </span>
            </div>
            <span className="text-xs font-sans text-muted-foreground">
              {event.registered}/{event.capacity}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground btn-primary-brighten group/btn"
        >
          View & Register
          <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
