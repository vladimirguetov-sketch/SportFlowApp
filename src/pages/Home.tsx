import React from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { Trophy, Activity, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const { events, loading } = useEvents();

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-3xl mt-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Sua Próxima Vitória Começa Aqui
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mt-4">
              A plataforma mais simples e alegre para organizar seus eventos esportivos. Crie, gerencie e participe de forma gratuita.
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Eventos Elite</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Inscrições Rápidas</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Seguro & Grátis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-orange-500" />
            Próximos Eventos
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-xl text-muted-foreground">Nenhum evento encontrado. Seja o primeiro a criar um!</p>
          </div>
        )}
      </section>
    </div>
  );
}
