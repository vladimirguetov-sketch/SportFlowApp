import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { toast } from 'sonner';
import { Mail, Phone, Chrome, Loader2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'google' | 'email' | 'phone'>('google');
  
  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Bem-vindo!');
      onClose();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro ao entrar com Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vindo de volta!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Conta criada com sucesso!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setShowOtp(true);
      toast.success('Código enviado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast.success('Bem-vindo!');
      onClose();
    } catch (error: any) {
      toast.error('Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="bg-orange-600 p-8 text-white text-center space-y-2">
          <h2 className="text-3xl font-black">SportFlow</h2>
          <p className="text-orange-100 opacity-90">
            {authMode === 'login' ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {(['google', 'email', 'phone'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'google' && <Chrome className="w-4 h-4" />}
                {tab === 'email' && <Mail className="w-4 h-4" />}
                {tab === 'phone' && <Phone className="w-4 h-4" />}
                <span className="capitalize">{tab === 'google' ? 'Google' : tab}</span>
              </button>
            ))}
          </div>

          {activeTab === 'google' && (
            <div className="space-y-4 py-4">
              <button 
                onClick={handleGoogleLogin} 
                className="w-full h-12 bg-white text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3 font-bold shadow-sm transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5 text-blue-500" />}
                Continuar com Google
              </button>
              <p className="text-center text-xs text-muted-foreground">
                A maneira mais rápida e segura de entrar.
              </p>
            </div>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block" htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block" htmlFor="password">Senha</label>
                <input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-lg font-bold text-white shadow-lg shadow-orange-200 transition-all disabled:opacity-50" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
              </button>
            </form>
          )}

          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!showOtp ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block" htmlFor="phone">Telefone (com DDD)</label>
                    <input 
                      id="phone" 
                      type="tel" 
                      placeholder="+55 11 99999-9999" 
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required 
                    />
                  </div>
                  <div id="recaptcha-container"></div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-lg font-bold text-white shadow-lg shadow-orange-200 transition-all disabled:opacity-50" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Código SMS'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block" htmlFor="otp">Código de Verificação</label>
                    <input 
                      id="otp" 
                      placeholder="123456" 
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-lg font-bold text-white shadow-lg shadow-orange-200 transition-all disabled:opacity-50" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
                  </button>
                  <button 
                    type="button" 
                    className="w-full text-xs text-gray-500 hover:text-orange-600 transition-colors" 
                    onClick={() => setShowOtp(false)}
                  >
                    Mudar número
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sm text-orange-600 hover:text-orange-700 font-bold transition-colors"
            >
              {authMode === 'login' ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
