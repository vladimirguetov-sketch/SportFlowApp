import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Trophy, LogIn, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { UserProfile } from '../types';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  profile: UserProfile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const handleLogout = () => signOut(auth);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              SportFlow
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {profile ? (
              <>
                <Link to="/create-event" className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors font-medium text-sm">
                  <PlusCircle className="w-4 h-4" />
                  Criar Evento
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Painel</span>
                </Link>
                <div className="flex items-center gap-2 ml-2 border-l pl-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    title="Sair"
                    className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)} 
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all shadow-md shadow-orange-200"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
