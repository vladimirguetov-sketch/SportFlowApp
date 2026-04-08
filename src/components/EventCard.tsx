import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white/50 backdrop-blur-sm group">
      <div className="aspect-video w-full overflow-hidden relative">
        <img 
          src={event.bannerUrl || `https://picsum.photos/seed/${event.id}/800/450`} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-500 hover:bg-orange-600">
            {event.price === 0 ? 'Grátis' : `R$ ${event.price.toFixed(2)}`}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-orange-500" />
          {format(new Date(event.startDate), "PPP", { locale: ptBR })}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/event/${event.id}`} className="w-full">
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
