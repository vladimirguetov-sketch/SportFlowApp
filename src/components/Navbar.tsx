import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { Trophy, LogIn, LogOut, PlusCircle, LayoutDashboard, User } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const handleLogin = () => signInWithPopup(auth, googleProvider);
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
                <Link to="/create-event">
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                    <PlusCircle className="w-4 h-4" />
                    Criar Evento
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2 ml-2 border-l pl-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleLogin} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar com Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
