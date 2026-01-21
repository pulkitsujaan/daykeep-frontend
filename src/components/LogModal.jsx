import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

const LogModal = ({ onClose, date, onSave, existingData }) => {
  const [logText, setLogText] = useState('');
  const [rating, setRating] = useState(3);

  // ... (useEffect logic remains the same) ...
  useEffect(() => {
    if (existingData) {
      setLogText(existingData.log || '');
      setRating(existingData.rating || 3);
    } else {
      setLogText('');
      setRating(3);
    }
  }, [existingData]);

  const handleSave = () => {
    onSave({
      date: format(date, 'yyyy-MM-dd'),
      log: logText,
      rating: rating,
    });
    onClose();
  };
  // ...

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Modal Content - Responsive Width and Max Height */}
      <div className="bg-paper-card dark:bg-night-card text-ink dark:text-chalk w-[95%] md:w-full max-w-md border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-none p-6 relative scale-100 transition-transform max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight">{format(date, 'MMM do')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Slider & Inputs (Same as before) */}
           <div>
            <div className="flex justify-between items-end mb-3">
                <label className="font-bold text-lg">Productivity</label>
                <span className="font-black text-xl md:text-2xl bg-ink text-paper-card dark:bg-chalk dark:text-night-bg px-3 py-1 rounded-lg">
                    {rating}/5
                </span>
            </div>
            <input 
              type="range" min="1" max="5" value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-ink dark:accent-chalk"
            />
             <div className="flex justify-between text-xs md:text-sm font-bold mt-2 opacity-50 uppercase tracking-widest">
                <span>Lazy</span>
                <span>On Fire</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-lg mb-3">Journal</label>
            <textarea
              rows="5"
              className="w-full p-4 bg-paper-bg dark:bg-black/20 border-2 border-ink dark:border-chalk rounded-2xl focus:ring-4 ring-blue-400/20 outline-none transition-all resize-none text-base md:text-lg"
              placeholder="What did you create today?"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={onClose} className="flex-1 py-3 font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-[2] py-3 bg-ink dark:bg-chalk text-white dark:text-night-bg font-black rounded-xl border-2 border-transparent hover:-translate-y-1 hover:shadow-lg transition-all">Save</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogModal;