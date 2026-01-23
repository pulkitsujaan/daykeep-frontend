import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';

const ProfilePictureModal = ({ isOpen, onClose, user, token, onUpdateUser }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('images', file); // Reusing existing upload route

    try {
      // 1. Upload Image
      const uploadRes = await axios.post('http://localhost:5000/api/entries/upload', formData, {
        headers: { 'Authorization': token, 'Content-Type': 'multipart/form-data' }
      });
      const newImageUrl = uploadRes.data[0]; // Get the URL

      // 2. Update User Profile
      handleSelectImage(newImageUrl);
      
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleSelectImage = async (imageUrl) => {
    setIsUploading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/update', {
        userId: user.id || user._id,
        profilePicture: imageUrl
      }, {
        headers: { Authorization: token }
      });

      // Update local state in App.jsx
      onUpdateUser(res.data);
      onClose();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-paper-card dark:bg-night-card text-ink dark:text-chalk w-full max-w-md border-3 border-ink dark:border-chalk rounded-3xl shadow-soft p-6 relative">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black">Change Avatar</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Upload Section */}
        <div 
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-ink/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-ink/5 hover:border-ink/40 transition-all mb-6 group"
        >
            <div className="p-4 bg-[var(--color-accent)] text-white rounded-full mb-3 group-hover:scale-110 transition-transform shadow-md">
                <UploadCloud size={32} />
            </div>
            <p className="font-bold text-sm uppercase tracking-widest opacity-60">Upload New Photo</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>

        {/* History Section */}
        {user.profilePictureHistory && user.profilePictureHistory.length > 0 && (
            <div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">
                    <ImageIcon size={16}/> Previous Avatars
                </h4>
                <div className="grid grid-cols-4 gap-3">
                    {user.profilePictureHistory.map((url, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleSelectImage(url)}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105
                                ${user.profilePicture === url ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30' : 'border-ink/10 hover:border-ink/30'}
                            `}
                        >
                            <img src={`http://localhost:5000${url}`} alt="history" className="w-full h-full object-cover" />
                            {user.profilePicture === url && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <CheckCircle className="text-white drop-shadow-md" size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {isUploading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                <div className="font-black text-xl animate-pulse">Updating...</div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePictureModal;