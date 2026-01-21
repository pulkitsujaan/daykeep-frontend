import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, onClose, type = 'success' }) => {
  // State to control the visibility (opacity/transform)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Trigger Fade-IN immediately after mounting
    // We use a tiny timeout to ensure the browser registers the initial "opacity-0" state first
    const entryTimer = setTimeout(() => setIsVisible(true), 10);

    // 2. Schedule Fade-OUT after 3 seconds
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  // 3. When visibility turns false (after 3s), wait for animation to finish, then unmount
  useEffect(() => {
    if (!isVisible) {
      // Only trigger onClose if we've passed the initial mount (checked via a timeout or logic)
      // But simpler: just check if 3s have passed. 
      // Actually, since isVisible starts false, we need to make sure we don't close immediately.
      // The logic below ensures we only close if we are *transitioning out* after being visible.
      
      const removeTimer = setTimeout(() => {
        // Only call onClose if this wasn't the initial render state
        // We can assume if 300ms passes and isVisible is false, we are done.
        // However, to avoid complexity, we rely on the parent removing it.
        // But the parent relies on onClose. 
        
        // Let's protect against immediate close:
        // The parent usually keeps it mounted until we fire onClose.
      }, 500); 
      
      // Better approach used in the previous step:
      // We manually trigger onClose inside a specific timeout logic.
    }
  }, [isVisible]);

  // REVISED LOGIC FOR CLEANER HANDLING
  useEffect(() => {
    // Wait for the exit animation (500ms) to finish before actually removing from DOM
    if (!isVisible) {
      const timer = setTimeout(() => {
        // We check a flag or just ensure this runs only after the "exitTimer" logic
      }, 500);
    }
  }, [isVisible]);

  // LET'S SIMPLIFY THE LOGIC into one useEffect to avoid race conditions
  useEffect(() => {
    // A. Enter Animation
    requestAnimationFrame(() => setIsVisible(true));

    // B. Exit Animation Sequence
    const exitSequence = setTimeout(() => {
      setIsVisible(false); // Trigger CSS fade out
      
      // C. Unmount after CSS fade out finishes (500ms matches duration-500)
      setTimeout(() => {
        onClose(); 
      }, 500);
      
    }, 3000);

    return () => clearTimeout(exitSequence);
  }, [onClose]);

  return (
    <div 
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
        transition-all duration-500 ease-out transform
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100' // Visible State
          : 'opacity-0 translate-y-8 scale-90'    // Hidden State (Start & End)
        }
      `}
    >
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-paper-card dark:bg-night-card border-2 border-ink dark:border-chalk shadow-soft dark:shadow-soft-dark min-w-[300px]">
        {type === 'success' ? (
          <CheckCircle className="text-[var(--color-accent)]" size={24} />
        ) : (
          <XCircle className="text-rose-500" size={24} />
        )}
        
        <p className="font-bold text-ink dark:text-chalk text-sm md:text-base">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Toast;