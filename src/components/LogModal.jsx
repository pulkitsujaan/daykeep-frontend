import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { X, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import axios from 'axios';

const LogModal = ({ onClose, date, onSave, existingData, token }) => { // <--- Added token prop
  const [logText, setLogText] = useState('');
  const [rating, setRating] = useState(3);
  const [images, setImages] = useState([]); // Stores URL strings (from DB)
  const [newFiles, setNewFiles] = useState([]); // Stores File objects (to be uploaded)
  const [previewUrls, setPreviewUrls] = useState([]); // Temporary previews for new files
  const [isUploading, setIsUploading] = useState(false);
  const currentHour = new Date().getHours();
  const isGracePeriod = currentHour >= 0 && currentHour < 4;

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (existingData) {
      setLogText(existingData.log || '');
      setRating(existingData.rating || 3);
      setImages(existingData.images || []);
    } else {
      setLogText('');
      setRating(3);
      setImages([]);
    }
    setNewFiles([]);
    setPreviewUrls([]);
  }, [existingData]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrent = images.length + newFiles.length;
    
    if (totalCurrent + files.length > 4) {
      alert("Maximum 4 images allowed!");
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsUploading(true);
    let finalImages = [...images]; // Start with existing images

    try {
      // 1. Upload new files if any
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(file => formData.append('images', file));

        // Use the new Upload Route
        const res = await axios.post('http://localhost:5000/api/entries/upload', formData, {
            headers: { 
                'Authorization': token,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Add the returned server paths to our list
        finalImages = [...finalImages, ...res.data];
      }

      // 2. Save the Entry with the image paths
      onSave({
        date: format(date, 'yyyy-MM-dd'),
        log: logText,
        rating: rating,
        images: finalImages
      });
      
      onClose();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-paper-card dark:bg-night-card text-ink dark:text-chalk w-[95%] md:w-full max-w-md border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-none p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight">{format(date, 'MMM do')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
           {/* Slider */}
           <div>
            <div className="flex justify-between items-end mb-3">
                <label className="font-bold text-lg">Productivity</label>
                <span className="font-black text-xl bg-ink text-paper-card dark:bg-chalk dark:text-night-bg px-3 py-1 rounded-lg">
                    {rating}/5
                </span>
            </div>
            <input 
              type="range" min="1" max="5" value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-ink dark:accent-chalk"
            />
          </div>
          {/* --- RESTORED LABELS --- */}
  <div className="flex justify-between px-2 mt-1">
      <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Lazy</span>
      <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Fire</span>
  </div>

          {/* Text Area */}
          <div>
            <label className="block font-bold text-lg mb-3">Journal</label>
            <textarea
              rows="4"
              className="w-full p-4 bg-paper-bg dark:bg-black/20 border-2 border-ink dark:border-chalk rounded-2xl focus:ring-4 ring-blue-400/20 outline-none transition-all resize-none text-base"
              placeholder="What did you create today?"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-lg flex items-center gap-2">
                    <ImageIcon size={20} /> Memories 
                    <span className="text-xs opacity-50 font-normal">({images.length + newFiles.length}/4)</span>
                </label>
                {(images.length + newFiles.length < 4) && (
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="text-xs font-bold bg-ink/10 dark:bg-chalk/10 hover:bg-ink/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <UploadCloud size={14} /> Add Photo
                    </button>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileSelect} 
                />
            </div>

            {/* Image Grid */}
            {(images.length > 0 || newFiles.length > 0) ? (
                <div className="grid grid-cols-4 gap-2">
                    {/* Existing Images (From DB) */}
                    {images.map((url, idx) => (
                        <div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-ink/20 group">
                            <img src={`http://localhost:5000${url}`} alt="memory" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeExistingImage(idx)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    
                    {/* New Files (Previews) */}
                    {previewUrls.map((url, idx) => (
                        <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-[var(--color-accent)] group">
                            <img src={url} alt="preview" className="w-full h-full object-cover opacity-80" />
                            <button 
                                onClick={() => removeNewFile(idx)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-20 border-2 border-dashed border-ink/30 rounded-xl flex items-center justify-center text-ink/40 cursor-pointer hover:bg-black/5 transition-colors"
                >
                    <span className="text-sm font-bold">No photos added</span>
                </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={onClose} disabled={isUploading} className="flex-1 py-3 font-bold rounded-xl hover:bg-black/5 transition-colors disabled:opacity-50">Cancel</button>
            <button 
                onClick={handleSave} 
                disabled={isUploading}
                className="flex-[2] py-3 bg-ink dark:bg-chalk text-white dark:text-night-bg font-black rounded-xl border-2 border-transparent hover:-translate-y-1 hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : (existingData ? 'Update Entry' : 'Save Entry')}
              {isGracePeriod && (
  <p className="text-[10px] font-bold text-orange-500 uppercase text-center mb-2">
    ✨ Night Owl Mode: Your streak is still safe!
  </p>
)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogModal;