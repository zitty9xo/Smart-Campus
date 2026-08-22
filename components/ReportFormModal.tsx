'use client';

import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, Clock, MapPin, Tag } from 'lucide-react';
import { ReportType } from '@/lib/types';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Water Bottle',
  'Wallet/ID',
  'Keys',
  'Apparel',
  'Accessories',
  'Books & Notes',
  'Other'
];

const PRESETS = [
  {
    name: 'Preset: Lost AirPods Max',
    type: 'lost' as ReportType,
    title: 'Silver Apple AirPods Max Headphones',
    category: 'Electronics',
    description: 'Lost my silver AirPods Max headphones in a smart case. Left ear cup has a noticeable micro dent on the aluminum finish. Last seen near Student Union lounge.',
    location: 'Student Union 2nd Floor Lounge',
    contactInfo: 'alex.airpods@campus.edu'
  },
  {
    name: 'Preset: Found Apple Watch',
    type: 'found' as ReportType,
    title: 'Apple Watch Series 8 (Midnight Aluminum)',
    category: 'Electronics',
    description: 'Found an Apple Watch Series 8 with dark blue sport loop band sitting on the sink edge in Campus Gym locker room. Screen has a protective glass film.',
    location: 'Campus Recreation Gym Locker Room',
    contactInfo: 'Turned into Gym Front Desk'
  },
  {
    name: 'Preset: Found Black Backpack',
    type: 'found' as ReportType,
    title: 'Black North Face Surge Laptop Backpack',
    category: 'Apparel',
    description: 'Black canvas backpack found under table in Science Library study room 204. Contains a yellow spiral notebook and blue water bottle inside.',
    location: 'Science Library Room 204',
    contactInfo: 'Science Library Desk'
  }
];

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [type, setType] = useState<ReportType>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));
  const [contactInfo, setContactInfo] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setType(preset.type);
    setTitle(preset.title);
    setCategory(preset.category);
    setDescription(preset.description);
    setLocation(preset.location);
    setContactInfo(preset.contactInfo);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setErrorMsg('Please fill in all required fields (Title, Description, Location).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          category,
          description,
          location,
          time: new Date(time).toISOString(),
          imageBase64: imageBase64 || undefined,
          contactInfo
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      // Reset Form & Close
      setTitle('');
      setDescription('');
      setLocation('');
      setContactInfo('');
      setImageBase64('');
      setImagePreview('');
      setIsSubmitting(false);

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting report');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Submit Lost or Found Report</h3>
              <p className="text-xs text-slate-400">Log item details for Gemini AI multimodal matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Fill Presets */}
        <div className="px-6 py-3 bg-purple-950/40 border-b border-purple-900/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Demo Quick Fill:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 transition-all font-medium"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Report Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Report Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                  type === 'lost'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-lg shadow-rose-900/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>I Lost An Item</span>
              </button>
              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                  type === 'found'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>I Found An Item</span>
              </button>
            </div>
          </div>

          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Photo Upload <span className="text-slate-500 font-normal">(Optional but recommended for AI visual matching)</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-44 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setImageBase64(''); setImagePreview(''); }}
                  className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all group">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Upload className="w-7 h-7 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-slate-300 mb-1">
                    Click or drag photo here to upload
                  </p>
                  <p className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Item Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony WH-1000XM4 Black Headphones"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description * <span className="text-slate-400 font-normal">(Include scratches, stickers, brand marks)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe color, brand, distinct scratches, stickers, case type, or specific distinguishing marks..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              required
            ></textarea>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campus Location *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Library 2nd Floor Study Desk"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date & Time Lost/Found</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Contact / Drop-off info */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact / Drop-off Location Reference
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. Student Union Desk or alex.student@campus.edu"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white ai-gradient-bg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/30"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
