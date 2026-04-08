/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetails } from './pages/EventDetails';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from './components/ui/sonner';
import { useEffect } from 'react';

export default function App() {
  const { profile, loading } = useAuth();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || document.getElementById('google-maps-script')) return;

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-bounce bg-orange-500 p-4 rounded-full shadow-lg">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#fafafa] selection:bg-orange-200 selection:text-orange-900">
        {/* Background Pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: `radial-gradient(#f97316 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
        />
        
        <Navbar profile={profile} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="border-t bg-white py-12 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <div className="flex justify-center items-center gap-2 font-bold text-orange-600">
              <div className="bg-orange-500 p-1 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              SportFlow
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SportFlow. Criado com ❤️ para atletas e organizadores.
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground font-medium uppercase tracking-widest">
              <span>Totalmente Gratuito</span>
              <span>Sem Anúncios</span>
              <span>Feito no Brasil</span>
            </div>
          </div>
        </footer>

        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}
