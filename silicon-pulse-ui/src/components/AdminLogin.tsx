import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { seoBridge } from '../api/seoBridge';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const AdminLogin = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const data = await seoBridge.login(email, password);
      login(data.token);
      showToast('Xác thực Quản trị viên thành công.');
    } catch (error) {
      setLoginError('Thông tin đăng nhập không hợp lệ hoặc không có quyền truy cập.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 glass-panel border border-cyan-900/30 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-900/20"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-cyan-500/30 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-serif text-white tracking-widest">COMMAND CENTER</h2>
          <p className="text-xs text-cyan-400/60 uppercase tracking-widest mt-2 font-mono">Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm placeholder:text-slate-500"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Master Password"
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 text-rose-400 text-sm font-mono bg-rose-400/10 p-3 rounded border border-rose-400/20">
              <AlertCircle size={16} />
              {loginError}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full relative group overflow-hidden bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(8,145,178,0.4)]"
          >
            {isLoggingIn ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                <Lock className="w-4 h-4" /> AUTHENTICATE
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
