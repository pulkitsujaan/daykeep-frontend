import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit3, Maximize2, Star } from 'lucide-react';

const ViewEntryModal = ({ date, data, onClose, onEdit }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!data) return null;

  return (
    <>
      {/* 1. MAIN MODAL */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-paper-card dark:bg-night-card text-ink dark:text-chalk w-[95%] md:w-full max-w-lg border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-none p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
          
          {/* Header with Edit & Close */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-3xl font-black tracking-tight">{format(date, 'MMM do')}</h3>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{format(date, 'EEEE')}</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={onEdit}
                className="p-2.5 rounded-xl bg-[var(--color-accent)] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                title="Edit Entry"
              >
                <Edit3 size={20} />
              </button>
              <button 
                onClick={onClose} 
                className="p-2.5 rounded-xl border-2 border-ink/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-8">
             {/* Rating Badge */}
             <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-lg font-black text-xl text-white shadow-sm
                  ${data.rating >= 4 ? 'bg-teal-700' : data.rating >= 3 ? 'bg-[#ae866c]' : 'bg-rose-900'}
                `}>
                    {data.rating}/5
                </div>
                <div className="flex text-[var(--color-accent)]">
                   {[...Array(data.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
             </div>

            {/* Journal Text */}
            {data.log ? (
              <div className="bg-paper-bg dark:bg-black/20 p-5 rounded-2xl border-2 border-ink/10 text-lg leading-relaxed whitespace-pre-wrap">
                {data.log}
              </div>
            ) : (
              <p className="italic opacity-50">No text written for this day.</p>
            )}

            {/* Image Grid */}
            {data.images && data.images.length > 0 && (
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-60 mb-3">Memories</h4>
                <div className="grid grid-cols-2 gap-3">
                    {data.images.map((url, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedImage(`http://localhost:5000${url}`)}
                          className="relative aspect-square rounded-2xl overflow-hidden border-2 border-ink/10 cursor-zoom-in group shadow-sm hover:shadow-md transition-all"
                        >
                            <img 
                              src={`http://localhost:5000${url}`} 
                              alt="memory" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. IMAGE LIGHTBOX (Pop-up) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2">
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ViewEntryModal;