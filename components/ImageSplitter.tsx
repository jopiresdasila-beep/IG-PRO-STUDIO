
import React, { useState, useRef } from 'react';
import { Upload, Scissors, Trash2, Download, Check, ArrowRight, FileArchive, FileImage } from 'lucide-react';
import { AspectRatio } from '../types';

interface Props {
  isDarkMode: boolean;
  onSlicesGenerated: (slices: string[], ratio: AspectRatio) => void;
}

export const ImageSplitter: React.FC<Props> = ({ isDarkMode, onSlicesGenerated }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [numSlices, setNumSlices] = useState(2);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('4:5');
  const [slices, setSlices] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(URL.createObjectURL(file));
      setSlices([]);
    }
  };

  const splitImage = () => {
    if (!sourceImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const results: string[] = [];
      const sliceWidth = img.width / numSlices;
      const sliceHeight = img.height;

      canvas.width = sliceWidth;
      canvas.height = sliceHeight;

      for (let i = 0; i < numSlices; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          i * sliceWidth, 0, sliceWidth, sliceHeight,
          0, 0, sliceWidth, sliceHeight
        );
        results.push(canvas.toDataURL('image/png'));
      }

      setSlices(results);
      setIsProcessing(false);
    };
    img.src = sourceImage;
  };

  const downloadIndividual = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `slide-${index + 1}.png`;
    link.click();
  };

  // Função para baixar todos os arquivos em sequência (ou ZIP se tivéssemos a lib)
  // Como não podemos adicionar libs externas facilmente sem configurações extras, 
  // vamos disparar os downloads individuais em massa.
  const downloadAll = () => {
    slices.forEach((slice, index) => {
      setTimeout(() => {
        downloadIndividual(slice, index);
      }, index * 200); // Delay pequeno para o navegador não bloquear múltiplos downloads
    });
  };

  const themeClasses = isDarkMode 
    ? {
        card: 'bg-[#121212] border-[#262626]',
        text: 'text-white',
        muted: 'text-gray-400',
        input: 'bg-[#1a1a1a] border-[#333] text-white',
        dropzone: 'border-[#333] bg-[#0a0a0a] text-gray-500',
        infoBox: 'bg-[#1a1a1a] border-[#333]'
      }
    : {
        card: 'bg-white border-gray-200',
        text: 'text-gray-900',
        muted: 'text-gray-500',
        input: 'bg-white border-gray-300 text-black',
        dropzone: 'border-gray-300 bg-gray-50 text-gray-400',
        infoBox: 'bg-gray-50 border-gray-100'
      };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full">
      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col">
            <h2 className={`text-2xl font-black uppercase italic ${themeClasses.text}`}>Recortador de Panorâmicas</h2>
            <p className={themeClasses.muted}>Transforme uma imagem larga em múltiplos slides perfeitamente alinhados.</p>
          </div>

          {!sourceImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-video border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-500/5 ${themeClasses.dropzone}`}
            >
              <Upload size={48} className="mb-4" />
              <p className="font-bold text-lg">Clique ou arraste sua imagem panorâmica aqui</p>
              <p className="text-sm mt-1">Formatos sugeridos: JPG, PNG, WEBP</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Preview Original */}
              <div className={`relative rounded-2xl overflow-hidden border ${themeClasses.card} shadow-xl`}>
                <div className="p-3 border-b flex items-center justify-between bg-black/[0.02]">
                   <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Preview de Corte</span>
                   <button onClick={() => setSourceImage(null)} className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="relative">
                  <img src={sourceImage} className="w-full h-auto block" alt="Source" />
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: numSlices - 1 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-full border-r-2 border-dashed border-blue-500/50 shadow-sm" 
                        style={{ width: `${100 / numSlices}%` }} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Section (Aparece após o recorte) */}
              {slices.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`p-6 rounded-2xl border ${themeClasses.infoBox} shadow-sm space-y-6`}>
                    <div>
                      <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${themeClasses.muted}`}>Informação</h4>
                      <p className={`text-lg ${themeClasses.text}`}>
                        <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold mr-2">{slices.length}</span>
                        imagens foram geradas com sucesso
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${themeClasses.muted}`}>Download das Imagens</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <p className={`text-sm font-medium mb-3 ${themeClasses.text}`}>Todos os arquivos:</p>
                          <button 
                            onClick={downloadAll}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#262626] dark:hover:bg-[#333] border border-gray-300 dark:border-[#444] rounded-md text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <FileArchive size={14} /> Download todos (Individualmente)
                          </button>
                        </div>

                        <div>
                          <p className={`text-sm font-medium mb-3 ${themeClasses.text}`}>Arquivos individuais:</p>
                          <div className="flex flex-wrap gap-2">
                            {slices.map((slice, i) => (
                              <button 
                                key={i}
                                onClick={() => downloadIndividual(slice, i)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-gray-200 dark:border-[#333] rounded-md text-[11px] font-medium transition-all shadow-sm active:scale-95"
                              >
                                <Download size={12} /> slide-{i+1}.png
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Side Panel */}
      <div className={`w-full lg:w-[350px] border-l p-6 overflow-y-auto ${themeClasses.card}`}>
        <div className="space-y-8">
          <section>
            <label className={`block text-[10px] font-black uppercase mb-3 ${themeClasses.muted}`}>Quantidade de Slides</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="2" 
                max="10" 
                value={numSlices}
                onChange={(e) => {
                  setNumSlices(parseInt(e.target.value));
                  setSlices([]); // Limpa o resultado se mudar a config
                }}
                className="flex-1 accent-blue-600"
              />
              <span className={`text-2xl font-black italic ${themeClasses.text}`}>{numSlices}</span>
            </div>
          </section>

          <section>
            <label className={`block text-[10px] font-black uppercase mb-3 ${themeClasses.muted}`}>Proporção Desejada</label>
            <div className="grid grid-cols-2 gap-2">
              {(['1:1', '4:5', '16:9'] as AspectRatio[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedRatio(r);
                    setSlices([]);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedRatio === r 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : `${themeClasses.input} hover:border-blue-500/50`
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-4 space-y-3">
            <button 
              disabled={!sourceImage || isProcessing}
              onClick={splitImage}
              className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                slices.length > 0 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {isProcessing ? 'Processando...' : slices.length > 0 ? <><Check size={20} /> Recortado!</> : <><Scissors size={20} /> Recortar Agora</>}
            </button>

            {slices.length > 0 && (
              <button 
                onClick={() => onSlicesGenerated(slices, selectedRatio)}
                className="w-full py-4 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl font-black uppercase italic tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 animate-bounce-short"
              >
                Enviar p/ Simulador <ArrowRight size={20} />
              </button>
            )}
          </div>

          <div className={`p-4 rounded-xl border text-[11px] leading-relaxed italic ${isDarkMode ? 'bg-[#1a1a1a] border-[#333] text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            DICA: Após o recorte, você verá as opções de download acima. Você pode baixar um por um ou todos de uma vez.
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
