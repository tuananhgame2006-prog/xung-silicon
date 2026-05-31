import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export type UserData = {
  name: string;
  email: string;
} | null;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserData) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate network delay for Google OAuth
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({ name: 'Người dùng Web', email: 'user@gmail.com' });
      onClose();
    }, 1500);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({ name: 'Demo User', email });
        onClose();
      }, 1000);
    } else if (mode === 'register') {
      if (!isHuman) return;
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMode('verify');
      }, 1000);
    } else if (mode === 'verify') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({ name, email });
        onClose();
        // Reset state after success
        setMode('login');
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-serif text-xl text-slate-800 font-bold">
                {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Xác thực Email'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full shadow-sm">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {mode !== 'verify' && (
                <>
                  {/* Google Login Button */}
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mb-6 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Tiếp tục với Google
                  </button>

                  <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Hoặc bằng Email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                </>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tên hiển thị</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ví dụ: Kỹ sư Nguyễn Văn A"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {mode !== 'verify' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Mật khẩu</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="password" required value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'register' && (
                  <div className="mt-4 p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between cursor-pointer" onClick={() => !loading && setIsHuman(!isHuman)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isHuman ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                        {isHuman && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700">Tôi là con người</span>
                    </div>
                    <ShieldCheck size={24} className="text-slate-400" />
                  </div>
                )}

                {mode === 'verify' && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="text-cyan-600 w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-600 mb-6">Mã xác nhận 6 số đã được gửi đến <strong>{email}</strong>. (Giả lập: Nhập bừa 6 số)</p>
                    <input 
                      type="text" required maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:border-cyan-400 focus:bg-white outline-none transition-colors mb-2"
                      disabled={loading}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || (mode === 'register' && !isHuman) || (mode === 'verify' && verifyCode.length < 6)}
                  className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Xác nhận Email & Hoàn tất'}
                </button>
              </form>

              {mode !== 'verify' && (
                <div className="mt-6 text-center text-sm text-slate-500">
                  {mode === 'login' ? (
                    <>Chưa có tài khoản? <button onClick={() => setMode('register')} className="text-cyan-600 font-bold hover:underline">Đăng ký ngay</button></>
                  ) : (
                    <>Đã có tài khoản? <button onClick={() => setMode('login')} className="text-cyan-600 font-bold hover:underline">Đăng nhập</button></>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
