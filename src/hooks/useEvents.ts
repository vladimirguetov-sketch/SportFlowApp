import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { Event } from '../types';

export function useEvents(organizerId?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'events'), orderBy('startDate', 'asc'));
    
    if (organizerId) {
      q = query(collection(db, 'events'), where('organizerId', '==', organizerId), orderBy('startDate', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizerId]);

  return { events, loading };
}
