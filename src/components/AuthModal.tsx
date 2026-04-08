import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { toast } from 'sonner';
import { Mail, Phone, Chrome, Loader2, X, ArrowRight, Trophy } from 'lucide-react';

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
      // Using browserPopupRedirectResolver is critical for iframe environments like AI Studio
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      toast.success('Bem-vindo ao SportFlow!');
      onClose();
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado pelo usuário.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domínio não autorizado. Adicione este domínio no Console do Firebase.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('O popup de login foi bloqueado pelo seu navegador.');
      } else {
        toast.error(`Erro ao entrar com Google: ${error.message}`);
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
        toast.success('Que bom ver você de novo!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Conta criada com sucesso! Bem-vindo!');
      }
      onClose();
    } catch (error: any) {
      console.error("Email Auth Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está em uso.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Email ou senha incorretos.');
      } else {
        toast.error(error.message || 'Erro na autenticação');
      }
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
      toast.success('Código enviado por SMS!');
    } catch (error: any) {
      console.error("Phone Auth Error:", error);
      toast.error('Erro ao enviar código. Verifique o número.');
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
      toast.success('Autenticado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      toast.error('Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Ultra-clean backdrop */}
      <div 
        className="absolute inset-0 bg-white/60 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Content - Minimalist Floating Card */}
      <div className="relative bg-white w-full max-w-[300px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-50 rounded-full transition-colors z-20 text-gray-300 hover:text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-10 space-y-6">
          {/* Simple Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">SportFlow</h2>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
              {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </p>
          </div>

          {/* Minimal Tabs */}
          <div className="flex justify-center border-b border-gray-50">
            {(['google', 'email', 'phone'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab 
                    ? 'text-orange-600' 
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                {tab === 'google' ? 'Google' : tab === 'email' ? 'Email' : 'Fone'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Compact Content */}
          <div className="min-h-[140px] flex flex-col justify-center">
            {activeTab === 'google' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full h-10 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4 text-blue-500" />}
                  Google
                </button>
              </div>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3 animate-in fade-in duration-300">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full h-10 px-4 rounded-xl border border-gray-100 focus:border-orange-500 focus:ring-0 outline-none transition-all bg-gray-50/50 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  className="w-full h-10 px-4 rounded-xl border border-gray-100 focus:border-orange-500 focus:ring-0 outline-none transition-all bg-gray-50/50 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 h-10 rounded-xl font-bold text-white text-xs transition-all active:scale-[0.98] disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
                </button>
              </form>
            )}

            {activeTab === 'phone' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {!showOtp ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <input 
                      type="tel" 
                      placeholder="Telefone" 
                      className="w-full h-10 px-4 rounded-xl border border-gray-100 focus:border-orange-500 focus:ring-0 outline-none transition-all bg-gray-50/50 text-xs"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required 
                    />
                    <div id="recaptcha-container"></div>
                    <button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 h-10 rounded-xl font-bold text-white text-xs transition-all active:scale-[0.98] disabled:opacity-50" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar SMS'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <input 
                      placeholder="Código" 
                      className="w-full h-10 px-4 rounded-xl border border-gray-100 focus:border-orange-500 focus:ring-0 outline-none transition-all bg-gray-50/50 text-center text-sm font-bold tracking-widest"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required 
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 h-10 rounded-xl font-bold text-white text-xs transition-all active:scale-[0.98] disabled:opacity-50" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Minimal Footer */}
          <div className="text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-[10px] text-gray-400 hover:text-orange-500 font-bold transition-all uppercase tracking-widest"
            >
              {authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
