import React, { useState } from 'react';
import { X, Sparkles, User, Mail, ArrowRight } from 'lucide-react';

const GoogleMockModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [useCustom, setUseCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const mockAccounts = [
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      avatar: '',
      tag: 'User'
    },
    {
      name: 'Tanya Goel',
      email: 'tanya.goel@gmail.com',
      avatar: '',
      tag: 'User'
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@gmail.com',
      avatar: '',
      tag: 'User'
    }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customEmail || !customEmail.includes('@')) {
      return setError('Please enter a valid email address');
    }

    const name = customName || customEmail.split('@')[0];
    onSelectAccount(customEmail, name, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-black text-xl text-white">Google Account</h3>
          <p className="text-slate-400 text-xs mt-1">Choose an account to sign in to AIFinder</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        {/* Custom Form or Account List */}
        {!useCustom ? (
          <div className="space-y-3">
            {/* Accounts List */}
            {mockAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => onSelectAccount(account.email, account.name, account.avatar)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0e1322] border border-white/5 hover:border-purple-500/30 hover:bg-purple-600/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm uppercase group-hover:bg-purple-500 group-hover:text-white transition-all">
                    {account.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {account.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{account.email}</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {account.tag}
                </span>
              </button>
            ))}

            {/* Custom Account Option */}
            <button
              onClick={() => setUseCustom(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-white/10 hover:border-purple-500/30 text-xs font-semibold text-slate-400 hover:text-purple-400 hover:bg-purple-600/5 transition-all text-center cursor-pointer"
            >
              + Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. user@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-all"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none transition-all"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setUseCustom(false); setError(''); }}
                className="w-1/2 py-2.5 border border-white/10 text-slate-300 font-semibold rounded-xl text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GoogleMockModal;
