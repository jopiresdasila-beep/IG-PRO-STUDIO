
import React, { useState } from 'react';
import { InstagramPost } from './components/InstagramPost';
import { ControlPanel } from './components/ControlPanel';
import { ImageSplitter } from './components/ImageSplitter';
import { PostData, PostImage, AspectRatio } from './types';
import { Layout, Scissors } from 'lucide-react';

const INITIAL_POST: PostData = {
  username: 'seu_usuario',
  avatar: 'https://picsum.photos/id/64/150/150',
  location: 'São Paulo, Brazil',
  caption: 'Este é o simulador oficial 1080x1350! Arraste para o lado ou clique nas setas para navegar entre as imagens. 📸✨',
  likes: 1240,
  isLiked: false,
  isBookmarked: false,
  images: [
    { id: '1', url: 'https://picsum.photos/id/10/1080/1350' },
    { id: '2', url: 'https://picsum.photos/id/20/1080/1350' },
    { id: '3', url: 'https://picsum.photos/id/30/1080/1350' },
    { id: '4', url: 'https://picsum.photos/id/40/1080/1350' },
  ],
  aspectRatio: '4:5',
  isDarkMode: false,
};

type Tab = 'simulator' | 'splitter';

export default function App() {
  const [post, setPost] = useState<PostData>(INITIAL_POST);
  const [activeTab, setActiveTab] = useState<Tab>('simulator');

  const handleUpdateImages = (newImages: PostImage[]) => {
    setPost(prev => ({ ...prev, images: newImages }));
  };

  const handleUpdatePost = (updates: Partial<PostData>) => {
    setPost(prev => ({ ...prev, ...updates }));
  };

  const handleSlicesGenerated = (slices: string[], ratio: AspectRatio) => {
    const newImages: PostImage[] = slices.map(url => ({
      id: Math.random().toString(36).substring(2, 11),
      url
    }));
    setPost(prev => ({ 
      ...prev, 
      images: newImages,
      aspectRatio: ratio 
    }));
    setActiveTab('simulator');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${post.isDarkMode ? 'bg-black text-white' : 'bg-[#fafafa] text-black'}`}>
      
      {/* Tab Navigation Header */}
      <header className={`sticky top-0 z-50 border-b px-6 py-3 flex items-center justify-between transition-colors ${post.isDarkMode ? 'bg-[#121212] border-[#262626]' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className={`text-xl font-black italic uppercase leading-none ${post.isDarkMode ? 'text-white' : 'text-gray-900'}`}>IG Pro Studio</h1>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Por Jó Gomes</span>
          </div>
          
          <nav className="flex items-center gap-2 bg-gray-500/10 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'simulator' ? (post.isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Layout size={14} /> Simulador
            </button>
            <button 
              onClick={() => setActiveTab('splitter')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'splitter' ? (post.isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Scissors size={14} /> Recortador (Splitter)
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {activeTab === 'simulator' ? (
          <>
            {/* Simulation Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 overflow-y-auto">
              <div className="w-full max-w-[470px]">
                <InstagramPost 
                  post={post} 
                  onLike={() => handleUpdatePost({ isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 })}
                  onBookmark={() => handleUpdatePost({ isBookmarked: !post.isBookmarked })}
                />
              </div>
            </div>

            {/* Settings / Controls */}
            <div className={`w-full lg:w-[400px] border-l overflow-y-auto p-6 transition-colors duration-300 ${post.isDarkMode ? 'bg-[#121212] border-[#262626]' : 'bg-white border-gray-200'}`}>
              <ControlPanel 
                post={post} 
                onUpdateImages={handleUpdateImages}
                onUpdatePost={handleUpdatePost}
              />
            </div>
          </>
        ) : (
          <ImageSplitter 
            isDarkMode={post.isDarkMode} 
            onSlicesGenerated={handleSlicesGenerated}
          />
        )}
      </main>
    </div>
  );
}
