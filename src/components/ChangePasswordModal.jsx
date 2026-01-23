import React, { useState } from 'react';
import axios from 'axios'; // Or import api from '../api' if you set it up
import { X, Lock, Check, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../api'; // Use your config

const ChangePasswordModal = ({ isOpen, onClose, userId, token }) => {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({ type: 'error', message: "New passwords don't match" });
    }
    if (formData.newPassword.length < 6) {
      return setStatus({ type: 'error', message: "Password must be at least 6 characters" });
    }

    setLoading(true);
    try {
      // Use your API instance or axios
      await axios.put(`${BASE_URL}/api/auth/password`, {
        userId,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: token }
      });

      setStatus({ type: 'success', message: 'Password changed successfully!' });
      setTimeout(() => {
        onClose();
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setStatus({ type: '', message: '' });
      }, 1500);

    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-paper-card dark:bg-night-card w-full max-w-sm border-3 border-ink dark:border-chalk rounded-3xl shadow-soft p-6 relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full">
          <X size={20} />
        </button>

        <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <Lock size={20} className="text-[var(--color-accent)]"/> Security
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
             <label className="text-xs font-bold opacity-60 uppercase">Current Password</label>
             <input 
               type="password" 
               className="w-full bg-paper-bg dark:bg-black/20 border-2 border-ink/10 rounded-xl p-3 font-bold focus:border-[var(--color-accent)] outline-none"
               value={formData.oldPassword}
               onChange={e => setFormData({...formData, oldPassword: e.target.value})}
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold opacity-60 uppercase">New Password</label>
             <input 
               type="password" 
               className="w-full bg-paper-bg dark:bg-black/20 border-2 border-ink/10 rounded-xl p-3 font-bold focus:border-[var(--color-accent)] outline-none"
               value={formData.newPassword}
               onChange={e => setFormData({...formData, newPassword: e.target.value})}
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold opacity-60 uppercase">Confirm New</label>
             <input 
               type="password" 
               className="w-full bg-paper-bg dark:bg-black/20 border-2 border-ink/10 rounded-xl p-3 font-bold focus:border-[var(--color-accent)] outline-none"
               value={formData.confirmPassword}
               onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
             />
          </div>

          {status.message && (
            <div className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${
                status.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-green-500/10 text-green-600'
            }`}>
                {status.type === 'error' ? <AlertCircle size={14}/> : <Check size={14}/>}
                {status.message}
            </div>
          )}

          <button 
            disabled={loading}
            className="mt-2 bg-ink dark:bg-chalk text-paper-bg dark:text-night-bg font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;