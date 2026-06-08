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
      name: 'Gunjan kumari Kushwaha',
      email: 'gunjankumarikushwaha080@gmail.com',
      avatar: '', // Fallback initials
      tag: 'Owner / Admin'
    },
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

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp z-10 p-6 sm:p-8">

        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Branding Header */}
        <div className="text-center mb-8 pt-2">
          {/* Mock Google Colorful Logo */}
          <div className="flex justify-center items-center gap-1 mb-4 select-none">
            <span className="text-2xl sm:text-3xl font-bold font-display text-blue-500">G</span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-red-500">o</span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-yellow-500">o</span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-blue-500">g</span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-green-500">l</span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-red-500">e</span>
          </div>
          <h3 className="font-display font-black text-xl text-white">Choose an account</h3>
          <p className="text-slate-400 text-xs mt-1">to continue to <strong className="text-purple-400 font-semibold">AIFinder</strong></p>
        </div>

        {/* Custom Form or Account List */}
        {!useCustom ? (
          <div className="space-y-3.5">
            {/* Accounts List */}
            {mockAccounts.map((account) => {
              const isOwner = account.email === 'gunjankumarikushwaha080@gmail.com';
              return (
                <button
                  key={account.email}
                  onClick={() => onSelectAccount(account.email, account.name, account.avatar)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0e1322] border border-white/5 hover:border-purple-500/30 hover:bg-purple-600/5 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle initials fallback for Google selection */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-display text-sm ${isOwner
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border border-white/5'
                      }`}>
                      {getInitials(account.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                        {account.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{account.email}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${isOwner
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      : 'bg-slate-800/80 border-white/5 text-slate-400'
                    }`}>
                    {account.tag}
                  </span>
                </button>
              );
            })}

            {/* Custom Account Toggle Button */}
            <button
              onClick={() => setUseCustom(true)}
              className="w-full py-3.5 rounded-2xl bg-transparent border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-white/[0.01] transition-all text-center text-xs font-semibold text-purple-400 cursor-pointer"
            >
              + Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/10 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0e1322] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Google Display Name"
                  className="w-full bg-[#0e1322] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setUseCustom(false); setError(''); }}
                className="w-1/2 py-3 border border-white/10 text-slate-300 font-semibold rounded-xl text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-white/5 pt-4">
          To test admin features, select the <strong className="text-slate-400">Gunjankumari Kushwaha</strong> owner email.
        </div>

      </div>
    </div>
  );
};

export default GoogleMockModal;
