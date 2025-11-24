import React, { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { api } from '../services/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'suggestion' | 'bug';
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialType = 'suggestion' }) => {
  const [type, setType] = useState<'suggestion' | 'bug'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [images, setImages] = useState<{ url: string; preview: string; loading: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = api.isAuthenticated();

  // Allowed image types (no ico or other non-photo formats)
  const allowedImageTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 5;
    const currentCount = images.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      setError('Máximo 5 imágenes permitidas');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    // Validate all files first
    for (const file of filesToProcess) {
      if (!allowedImageTypes.includes(file.type)) {
        setError('Solo se permiten imágenes (PNG, JPG, GIF, WEBP, HEIC)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagen debe ser menor a 5MB');
        return;
      }
    }

    setIsUploading(true);
    setError('');

    try {
      for (const file of filesToProcess) {
        // Create preview URL and add image immediately with loading state
        const preview = URL.createObjectURL(file);

        setImages(prev => [...prev, { url: '', preview, loading: true }]);

        // Upload directly to Vercel Blob
        const timestamp = Date.now();
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const filename = `ticket-${timestamp}${ext}`;

        const blob = await upload(filename, file, {
          access: 'public',
          handleUploadUrl: '/api/upload/client-token',
        });

        // Update the image with the actual URL and remove loading state
        setImages(prev => prev.map(img =>
          img.preview === preview ? { ...img, url: blob.url, loading: false } : img
        ));
      }
    } catch (err) {
      // Remove any images that failed to upload
      setImages(prev => prev.filter(img => !img.loading));
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        type,
        title,
        description,
        images: images.map(img => img.url) // Send only URLs
      };

      if (!isAuthenticated) {
        payload.email = email;
        payload.name = name;
      }

      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && { Authorization: `Bearer ${localStorage.getItem('authToken')}` })
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el ticket');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setType('suggestion');
        setTitle('');
        setDescription('');
        setEmail('');
        setName('');
        setImages([]);
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Contáctanos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">¡Ticket enviado!</h3>
            <p className="text-slate-600">Te enviaremos una confirmación por correo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Tipo de mensaje
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    type === 'suggestion'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium">Sugerencia</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    type === 'bug'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">Reportar Bug</span>
                </button>
              </div>
            </div>

            {/* Guest info (only if not authenticated) */}
            {!isAuthenticated && (
              <>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                    placeholder="tu@email.com"
                  />
                </div>
              </>
            )}

            {/* Title */}
            <div>
              <label htmlFor="contact-title" className="block text-sm font-semibold text-slate-700 mb-2">
                Título
              </label>
              <input
                type="text"
                id="contact-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                placeholder={type === 'suggestion' ? 'Ej: Agregar más sabores' : 'Ej: Error al cargar imágenes'}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="contact-description" className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                id="contact-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
                placeholder={type === 'suggestion' ? 'Describe tu sugerencia...' : 'Describe el problema que encontraste...'}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Imágenes <span className="text-slate-400 font-normal">(opcional, máx. 5)</span>
              </label>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded-lg border-2 border-slate-200 ${img.loading ? 'opacity-50' : ''}`}
                      />
                      {img.loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}
                      {!img.loading && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Agregar imagen
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/heic,image/heif,.png,.jpg,.jpeg,.gif,.webp,.heic,.heif"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUploading || images.some(img => img.loading)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
