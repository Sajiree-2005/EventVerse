import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import RegistrationModal from "@/components/RegistrationModal";
import CountdownTimer from "@/components/CountdownTimer";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Award, CheckCircle2, BookOpen, ListChecks } from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();
  const { events } = useApp();
  const event = events.find((e) => e.id === id);
  const [modalOpen, setModalOpen] = useState(false);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-sm text-primary hover:underline">Back to Events</Link>
      </div>
    );
  }

  const seatsLeft = event.capacity - event.registered;
  const capacityPercent = (event.registered / event.capacity) * 100;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <img src={event.poster} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/10" />
        <div className="relative flex h-full flex-col justify-end">
          <div className="container mx-auto px-4 pb-10">
            <Link to="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft size={14} /> Back to Events
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                {event.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">{event.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-primary-foreground/80 font-sans">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
          {/* Left content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-primary" />
                <h2 className="text-xl font-bold text-foreground">About this Event</h2>
              </div>
              <p className="text-base leading-relaxed font-serif text-muted-foreground">{event.description}</p>
            </section>

            {/* Eligibility */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Eligibility</h2>
              </div>
              <ul className="space-y-2 text-sm font-serif text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Open to all college students</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> No prior experience required</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Valid student ID mandatory</li>
              </ul>
            </section>

            {/* Schedule */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Event Schedule</h2>
              </div>
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
                    <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 font-semibold text-primary font-sans">{item.time}</span>
                    <span className="font-serif text-muted-foreground">{item.activity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rewards */}
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Rewards & Benefits</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Certificate of Participation",
                  "Cash Prizes for Winners",
                  "Networking Opportunities",
                  "Free Refreshments",
                ].map((reward) => (
                  <div key={reward} className="flex items-center gap-2 rounded-xl bg-background p-3 text-sm font-sans text-foreground border border-border/50">
                    <Award size={14} className="text-primary shrink-0" />
                    {reward}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="card-elevated p-6 sticky top-20">
              <h3 className="section-title">Event Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users size={16} className="text-primary" />
                  <span className="font-sans text-foreground">{seatsLeft > 0 ? `${seatsLeft} seats remaining` : "Fully booked"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-primary" />
                  <span className="font-sans text-foreground">Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Capacity */}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-sans text-muted-foreground mb-2">
                  <span>{event.registered} registered</span>
                  <span>{event.capacity} total</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${capacityPercent}%` }} />
                </div>
              </div>

              <CountdownTimer targetDate={event.date} variant="detail" />

              <button
                onClick={() => setModalOpen(true)}
                disabled={seatsLeft <= 0}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground btn-primary-brighten disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {seatsLeft > 0 ? "Register Now" : "Event Full"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal event={event} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default EventDetail;
