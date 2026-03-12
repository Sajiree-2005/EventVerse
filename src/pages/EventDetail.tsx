import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import RegistrationModal from "@/components/RegistrationModal";
import CountdownTimer from "@/components/CountdownTimer";
import {
  ArrowLeft, MapPin, Calendar, Users, Clock, Award, CheckCircle2,
  BookOpen, ListChecks, Share2, Bookmark,
} from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();
  const { events } = useApp();
  const event = events.find((e) => e.id === id);
  const [modalOpen, setModalOpen] = useState(false);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const seatsLeft = event.capacity - event.registered;
  const capacityPercent = (event.registered / event.capacity) * 100;
  const isFull = seatsLeft <= 0;

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src={event.poster}
          alt={event.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-sm font-medium text-white/90 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={14} />
            Events
          </Link>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 backdrop-blur-md transition-all">
              <Share2 size={14} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 backdrop-blur-md transition-all">
              <Bookmark size={14} />
            </button>
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                {event.category}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl drop-shadow-md">
              {event.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen size={15} className="text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">About this Event</h2>
              </div>
              <p className="text-base leading-relaxed font-serif text-muted-foreground">{event.description}</p>
            </section>

            {/* Eligibility */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 size={15} className="text-primary" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Eligibility</h2>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Open to all enrolled college students",
                  "No prior experience required",
                  "Valid student ID mandatory at check-in",
                  "Teams of 1–4 members (for team events)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm font-serif text-muted-foreground">
                    <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Schedule */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <ListChecks size={15} className="text-primary" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Event Schedule</h2>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[60px] top-3 bottom-3 w-px bg-border/60" />
                <div className="space-y-4">
                  {[
                    { time: "09:00 AM", activity: "Registration & Check-in" },
                    { time: "10:00 AM", activity: "Opening Ceremony & Keynote" },
                    { time: "11:30 AM", activity: "Main Event / Sessions Begin" },
                    { time: "01:00 PM", activity: "Lunch Break" },
                    { time: "02:00 PM", activity: "Workshops & Activities" },
                    { time: "04:30 PM", activity: "Closing Ceremony & Awards" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                      <span className="shrink-0 w-[52px] text-right text-[11px] font-bold text-primary font-sans">
                        {item.time}
                      </span>
                      <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="font-serif text-muted-foreground">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Rewards */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Award size={15} className="text-primary" />
                </div>
                <h2 className="text-base font-extrabold text-foreground">Rewards & Benefits</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Certificate of Participation",
                  "Cash Prizes for Winners",
                  "Networking Opportunities",
                  "Free Refreshments",
                ].map((reward) => (
                  <div
                    key={reward}
                    className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Award size={13} className="text-primary shrink-0" />
                    {reward}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card-elevated p-6 sticky top-20">
              {/* Countdown */}
              <CountdownTimer targetDate={event.date} variant="detail" />

              {/* Details */}
              <div className="mt-5 space-y-3 py-4 border-t border-b border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <Users size={15} className="text-primary shrink-0" />
                  <span className={`font-medium ${isFull ? "text-destructive" : "text-foreground"}`}>
                    {isFull ? "Event fully booked" : `${seatsLeft} seats remaining`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={15} className="text-primary shrink-0" />
                  <span className="text-foreground font-medium">
                    Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-sans text-muted-foreground mb-2">
                  <span>{event.registered} registered</span>
                  <span>{event.capacity} capacity</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isFull ? "bg-destructive" : capacityPercent > 75 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 text-right font-sans">
                  {Math.round(capacityPercent)}% filled
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => setModalOpen(true)}
                disabled={isFull}
                className={`mt-5 w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-300 ${
                  isFull
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground btn-primary-brighten shadow-lg shadow-primary/25"
                }`}
              >
                {isFull ? "Event Full" : "Register Now →"}
              </button>

              {!isFull && (
                <p className="mt-3 text-center text-xs font-serif text-muted-foreground">
                  Free registration · No payment required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal event={event} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default EventDetail;
