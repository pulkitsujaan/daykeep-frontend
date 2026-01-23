import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Logo from './Logo'; // <--- Import it
import api from '../api';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Backend URL (Make sure your server is running on port 5000)
    const endpoint = isLogin ? '/login' : '/register';
    const route = `auth/${endpoint}`;

    try {
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(route, payload);

      if (isLogin) {
        // Success: Pass token and user data up to App.js
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        // Registration Success: Usually requires email verification
        alert("Account created! Please check your email to verify before logging in.");
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper-bg transition-colors duration-500">
      
      <div className="w-full max-w-md bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-soft-dark p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* --- BRANDING SECTION --- */}
        <div className="flex justify-center mb-8">
            <Logo size="large" />
        </div>
        {/* ------------------------ */}

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-ink dark:text-chalk opacity-70">
            {isLogin ? 'Welcome Back' : 'Start Your Journey'}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-rose-100 border-2 border-rose-500 text-rose-700 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Signup Only) */}
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 dark:text-chalk/50" size={20} />
              <input 
                type="text" 
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-transparent border-2 border-ink/20 dark:border-chalk/20 rounded-2xl focus:border-ink dark:focus:border-chalk focus:ring-2 ring-[var(--color-accent)]/20 outline-none font-bold text-ink dark:text-chalk transition-all"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 dark:text-chalk/50" size={20} />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-transparent border-2 border-ink/20 dark:border-chalk/20 rounded-2xl focus:border-ink dark:focus:border-chalk focus:ring-2 ring-[var(--color-accent)]/20 outline-none font-bold text-ink dark:text-chalk transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 dark:text-chalk/50" size={20} />
            <input 
              type="password" 
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-transparent border-2 border-ink/20 dark:border-chalk/20 rounded-2xl focus:border-ink dark:focus:border-chalk focus:ring-2 ring-[var(--color-accent)]/20 outline-none font-bold text-ink dark:text-chalk transition-all"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-ink dark:bg-chalk text-white dark:text-night-bg font-black rounded-2xl border-2 border-transparent hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Create Account')}
            {!isLoading && <ArrowRight size={20} />}
          </button>

        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-ink/60 dark:text-chalk/60 font-bold text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[var(--color-accent)] hover:underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;