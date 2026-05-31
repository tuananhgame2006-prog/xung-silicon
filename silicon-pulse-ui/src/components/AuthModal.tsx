import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Vui lòng điền đủ thông tin.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await seoBridge.requestOTP(email);
      setStep('otp');
      setStatus('idle');
    } catch {
      setStatus('error');
      setErrorMsg('Không thể gửi OTP. Vui lòng kiểm tra email.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await seoBridge.registerUser(email, code);
      onLoginSuccess({ name: name.trim(), email: email.trim() });
      onClose();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Mã xác nhận sai.');
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
                {step === 'info' ? 'Tạo Hồ sơ Thảo luận' : 'Xác thực Email'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full shadow-sm">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6">
                {step === 'info' 
                  ? 'Vui lòng nhập tên và email của bạn để bắt đầu chia sẻ ý kiến trong cộng đồng.' 
                  : `Mã xác nhận 4 số đã được gửi tới ${email}.`}
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
                  {errorMsg}
                </div>
              )}

              {step === 'info' ? (
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tên hiển thị <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ví dụ: Kỹ sư Nguyễn Văn A"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                        disabled={status === 'loading'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Để nhận mã xác nhận"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                        disabled={status === 'loading'}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'loading' || !name.trim() || !email.trim()}
                    className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    Tiếp tục
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Mã xác nhận (4 số) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" required maxLength={4} pattern="\d{4}"
                      value={code} onChange={e => setCode(e.target.value)}
                      placeholder="Nhập mã xác nhận"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-xl tracking-widest font-mono focus:border-cyan-400 focus:bg-white outline-none transition-colors"
                      disabled={status === 'loading'}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'loading' || code.length !== 4}
                    className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    Xác nhận Tham gia
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
