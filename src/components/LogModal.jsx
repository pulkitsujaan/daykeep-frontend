import React, { useState, useEffect, useRef } from "react";
import { format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import {
  X,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Target,
  Plus,
  CheckSquare,
  Square,
  XSquare,
} from "lucide-react";
import api, { getImageUrl } from "../api";

const LogModal = ({ onClose, date, onSave, existingData, token }) => {
  const [logText, setLogText] = useState("");
  const [rating, setRating] = useState(3);
  const [images, setImages] = useState([]); // Stores URL strings (from DB)
  const [newFiles, setNewFiles] = useState([]); // Stores File objects (to be uploaded)
  const [previewUrls, setPreviewUrls] = useState([]); // Temporary previews for new files
  const [isUploading, setIsUploading] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState("");

  const fileInputRef = useRef(null);

  // --- DATE & TIME LOGIC ---
  const today = startOfDay(new Date());
  const isFuture = isAfter(date, today);
  const isPast = isBefore(date, today);
  const isToday = isSameDay(date, today);

  const currentHour = new Date().getHours();
  const isGracePeriod = currentHour >= 0 && currentHour < 4;

  useEffect(() => {
    if (existingData) {
      setLogText(existingData.log || "");
      setRating(existingData.rating || (isFuture ? 0 : 3));
      setImages(existingData.images || []);
      setTasks(existingData.tasks || []);
    } else {
      setLogText("");
      setRating(isFuture ? 0 : 3);
      setImages([]);
      setTasks([]);
    }
    setNewFiles([]);
    setPreviewUrls([]);
  }, [existingData, isFuture]);

  // Clean up object URLs
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // --- TASK HANDLERS ---
  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [...prev, { text: newTaskInput, isCompleted: false }]);
    setNewTaskInput("");
  };

  const toggleTask = (index) => {
    setTasks((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );
  };

  const removeTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // --- IMAGE HANDLERS ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrent = images.length + newFiles.length;

    if (totalCurrent + files.length > 4) {
      alert("Maximum 4 images allowed!");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SAVE HANDLER ---
  const handleSave = async () => {
    setIsUploading(true);
    let finalImages = [...images];

    try {
      // 1. Upload new files if any
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append("images", file));

        const res = await api.post("/entries/upload", formData, {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        });
        finalImages = [...finalImages, ...res.data];
      }

      // 2. Save everything to DB
      onSave({
        date: format(date, "yyyy-MM-dd"),
        log: logText,
        rating: isFuture ? 0 : rating,
        images: finalImages,
        tasks: tasks, // <--- Sending tasks
      });

      onClose();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to save entry");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-paper-card dark:bg-night-card text-ink dark:text-chalk w-[95%] md:w-full max-w-md border-3 border-ink dark:border-chalk rounded-3xl shadow-soft p-6 relative max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              {format(date, "MMM do")}
            </h3>
            {isFuture && (
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Future Planning
              </span>
            )}
            {isPast && (
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                History
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. SLIDER (Only show if NOT Future) */}
          {!isFuture && (
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="font-bold text-lg">Productivity</label>
                <span className="font-black text-xl bg-ink text-paper-card dark:bg-chalk dark:text-night-bg px-3 py-1 rounded-lg">
                  {rating}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-ink dark:accent-chalk"
              />
              <div className="flex justify-between px-1 mt-1">
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
                  Lazy
                </span>
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
                  Fire
                </span>
              </div>
            </div>
          )}

          {/* 2. TASK LIST (The Core Feature) */}
          <div>
            <label className="block font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={20} />
              {isFuture ? "Goals for the Day" : "Tasks & Results"}
            </label>

            <div className="space-y-2 mb-3">
              {tasks.map((task, idx) => {
                // LOGIC: A task is "Missed" if it is NOT completed AND the day is in the Past
                const isMissed = isPast && !task.isCompleted;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                                ${
                                  isMissed
                                    ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30"
                                    : "bg-paper-bg dark:bg-black/20 border-ink/10 group"
                                }
                            `}
                  >
                    {/* CHECKBOX / MISSED ICON */}
                    <button
                      onClick={() => !isFuture && toggleTask(idx)}
                      disabled={isFuture}
                      className={`p-1 rounded-md transition-colors 
                                    ${task.isCompleted ? "text-[var(--color-accent)]" : isMissed ? "text-rose-500" : "text-ink/30 hover:text-ink"}
                                `}
                    >
                      {task.isCompleted ? (
                        <CheckSquare size={20} />
                      ) : isMissed ? (
                        <XSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>

                    {/* TEXT */}
                    <span
                      className={`flex-1 font-bold 
                                ${task.isCompleted ? "line-through opacity-50" : ""}
                                ${isMissed ? "text-rose-700 dark:text-rose-400" : ""}
                            `}
                    >
                      {task.text}
                    </span>

                    {/* DELETE BUTTON or MISSED LABEL */}
                    {isMissed ? (
                      <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider">
                        Incomplete
                      </span>
                    ) : (
                      <button
                        onClick={() => removeTask(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="text-center p-4 border-2 border-dashed border-ink/20 rounded-xl opacity-50 text-sm font-bold">
                  {isFuture ? "No goals set yet." : "No tasks found."}
                </div>
              )}
            </div>

            {/* Add Task Input (Hide if Past, unless you want to allow backfilling) */}
            {!isPast && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask(e)}
                  placeholder="Add a new task..."
                  className="flex-1 p-3 bg-paper-bg dark:bg-black/20 border-2 border-ink/20 dark:border-chalk/20 rounded-xl focus:border-ink dark:focus:border-chalk outline-none font-bold"
                />
                <button
                  onClick={handleAddTask}
                  className="p-3 bg-ink text-white dark:bg-chalk dark:text-night-bg rounded-xl hover:scale-105 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          {/* 3. JOURNAL TEXT AREA (Hide in Future) */}
          {!isFuture && (
            <div>
              <label className="block font-bold text-lg mb-3 mt-6">
                Journal Notes
              </label>
              <textarea
                rows="3"
                className="w-full p-4 bg-paper-bg dark:bg-black/20 border-2 border-ink dark:border-chalk rounded-2xl focus:ring-4 ring-blue-400/20 outline-none transition-all resize-none text-base"
                placeholder="Any additional thoughts?"
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
              />
            </div>
          )}

          {/* 4. IMAGE UPLOAD (Hide if Future) */}
          {!isFuture && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-lg flex items-center gap-2">
                  <ImageIcon size={20} /> Memories
                  <span className="text-xs opacity-50 font-normal">
                    ({images.length + newFiles.length}/4)
                  </span>
                </label>
                {images.length + newFiles.length < 4 && (
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

              {/* IMAGE GRID */}
              {images.length > 0 || newFiles.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {/* Existing Images (From DB) */}
                  {images.map((url, idx) => (
                    <div
                      key={`exist-${idx}`}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-ink/20 group"
                    >
                      <img
                        src={getImageUrl(url)}
                        alt="memory"
                        className="w-full h-full object-cover"
                      />
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
                    <div
                      key={`new-${idx}`}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-[var(--color-accent)] group"
                    >
                      <img
                        src={url}
                        alt="preview"
                        className="w-full h-full object-cover opacity-80"
                      />
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
                  className="w-full h-16 border-2 border-dashed border-ink/30 rounded-xl flex items-center justify-center text-ink/40 cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <span className="text-sm font-bold">No photos added</span>
                </div>
              )}
            </div>
          )}

          {/* Night Owl Notice */}
          {isGracePeriod && isToday && (
            <p className="text-[10px] font-bold text-orange-500 uppercase text-center mt-4">
              ✨ Night Owl Mode: Your streak is still safe!
            </p>
          )}

          {/* FOOTER */}
          <div className="flex gap-4 pt-4 border-t-2 border-ink/5 mt-4">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-3 font-bold rounded-xl hover:bg-black/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-[2] py-3 bg-ink dark:bg-chalk text-white dark:text-night-bg font-black rounded-xl hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading
                ? "Saving..."
                : isFuture
                  ? existingData
                    ? "Update Plan"
                    : "Save Plan"
                  : existingData
                    ? "Update Entry"
                    : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
