
import React, { useRef } from 'react';
import { PostData, PostImage, AspectRatio } from '../types';
import { Upload, X, Trash2, Plus, Moon, Sun, UserCircle } from 'lucide-react';

interface Props {
  post: PostData;
  onUpdateImages: (images: PostImage[]) => void;
  onUpdatePost: (updates: Partial<PostData>) => void;
}

export const ControlPanel: React.FC<Props> = ({ post, onUpdateImages, onUpdatePost }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const remainingSlots = 20 - post.images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const newImages: PostImage[] = filesToProcess.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      url: URL.createObjectURL(file),
      file
    }));

    onUpdateImages([...post.images, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdatePost({ avatar: URL.createObjectURL(file) });
    }
  };

  const removeImage = (id: string) => {
    onUpdateImages(post.images.filter(img => img.id !== id));
  };

  const clearAll = () => {
    onUpdateImages([]);
  };

  const inputClasses = `w-full p-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
    post.isDarkMode ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-gray-200 text-black'
  }`;

  const labelClasses = `block text-[10px] font-bold uppercase mb-1 ${
    post.isDarkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <div className="space-y-8 pb-20">
      {/* Theme Toggle */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${post.isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Aparência</h3>
          <button 
            onClick={() => onUpdatePost({ isDarkMode: !post.isDarkMode })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              post.isDarkMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {post.isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            {post.isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </section>

      {/* Proportions */}
      <section>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${post.isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Proporção</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['1:1', '4:5', '16:9'] as AspectRatio[]).map(ratio => (
            <button
              key={ratio}
              onClick={() => onUpdatePost({ aspectRatio: ratio })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                post.aspectRatio === ratio 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                : `${post.isDarkMode ? 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`
              }`}
            >
              {ratio} {ratio === '4:5' ? '(1080x1350)' : ''}
            </button>
          ))}
        </div>
      </section>

      {/* Profile & Info */}
      <section className="space-y-4">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${post.isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Informações</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            <img src={post.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" alt="Avatar" />
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <Plus size={20} />
            </button>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1">
            <label className={labelClasses}>Usuário</label>
            <input 
              type="text" 
              value={post.username}
              onChange={(e) => onUpdatePost({ username: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClasses}>Curtidas</label>
            <input 
              type="number" 
              value={post.likes}
              onChange={(e) => onUpdatePost({ likes: parseInt(e.target.value) || 0 })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Local</label>
            <input 
              type="text" 
              value={post.location}
              onChange={(e) => onUpdatePost({ location: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Legenda</label>
            <textarea 
              rows={3}
              value={post.caption}
              onChange={(e) => onUpdatePost({ caption: e.target.value })}
              className={`${inputClasses} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Images Carousel Manager */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${post.isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Imagens ({post.images.length}/20)
          </h3>
          {post.images.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {post.images.map((img, idx) => (
            <div key={img.id} className="relative aspect-[4/5] group">
              <img 
                src={img.url} 
                className={`w-full h-full object-cover rounded-md border ${post.isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}
                alt=""
              />
              <button 
                onClick={() => removeImage(img.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] px-1 rounded">
                {idx + 1}
              </div>
            </div>
          ))}
          
          {post.images.length < 20 && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[4/5] border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors ${
                post.isDarkMode ? 'border-[#333] text-gray-600 hover:text-blue-500 hover:border-blue-500' : 'border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-500'
              }`}
            >
              <Plus size={24} />
              <span className="text-[10px] font-bold">Add</span>
            </button>
          )}
        </div>

        <input 
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={post.images.length >= 20}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <Upload size={18} /> Carregar Imagens
        </button>
      </section>

      <div className={`p-4 rounded-xl border italic ${post.isDarkMode ? 'bg-[#1a1a1a] border-[#333] text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p className="text-xs leading-relaxed">
          💡 Para simular o arraste, clique e puxe as imagens para o lado com o mouse. Clique nos botões laterais para saltar imagens.
        </p>
      </div>
    </div>
  );
};
