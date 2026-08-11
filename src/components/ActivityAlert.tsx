import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { parseISO, differenceInMinutes } from 'date-fns';

export function ActivityAlert() {
  const { token, appUser } = useAuth();
  const [upcomingEvent, setUpcomingEvent] = useState<any | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !appUser) return;
    
    // We only need to check if they are an active member, but everyone active can see it.
    if (appUser.role === 'pending_operator' || appUser.role === 'non_aktif') return;

    const fetchUpcomingEvents = async () => {
      try {
        const res = await fetch('/api/events?all=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const events = await res.json();
          checkEvents(events);
        }
      } catch (error) {
        console.error("Failed to fetch events for alert", error);
      }
    };

    const checkEvents = (events: any[]) => {
      const now = new Date();
      
      const upcoming = events.find(event => {
        if (dismissed.includes(event.id.toString())) return false;
        
        const eventDate = parseISO(event.date);
        const diffMinutes = differenceInMinutes(eventDate, now);
        
        // Between 0 and 60 minutes
        return diffMinutes > 0 && diffMinutes <= 60;
      });
      
      if (upcoming) {
        setUpcomingEvent(upcoming);
      } else {
        setUpcomingEvent(null);
      }
    };

    fetchUpcomingEvents();
    
    const interval = setInterval(fetchUpcomingEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token, appUser, dismissed]);

  if (!upcomingEvent) return null;

  const dismiss = () => {
    setDismissed([...dismissed, upcomingEvent.id.toString()]);
    setUpcomingEvent(null);
  };

  const minutesLeft = differenceInMinutes(parseISO(upcomingEvent.date), new Date());

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
        <div className="bg-white/20 p-2 rounded-xl shrink-0">
          <Bell size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="font-bold text-[15px] mb-0.5">Kegiatan Segera Mulai!</h4>
          <p className="text-blue-100 text-sm truncate">
            {upcomingEvent.title}
          </p>
          <p className="text-white font-semibold text-xs mt-1">
            Mulai dalam {minutesLeft} menit
          </p>
        </div>
        <button 
          onClick={dismiss}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0 -mr-1 -mt-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
