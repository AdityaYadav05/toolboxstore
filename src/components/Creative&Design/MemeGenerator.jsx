import { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Type, Image } from 'lucide-react';

const MemeGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [customImage, setCustomImage] = useState(null);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Popular meme templates
  const memeTemplates = [
    {
      id: 1,
      name: 'Drake Hotline Bling',
      url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=500&h=500&fit=crop'
    },
    {
      id: 2,
      name: 'Distracted Boyfriend',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop'
    },
    {
      id: 3,
      name: 'Two Buttons',
      url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&h=500&fit=crop'
    },
    {
      id: 4,
      name: 'Change My Mind',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
    },
    {
      id: 5,
      name: 'Woman Yelling at Cat',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop'
    },
    {
      id: 6,
      name: 'Success Kid',
      url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&h=500&fit=crop'
    },
    {
      id: 7,
      name: 'Surprised Pikachu',
      url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&h=500&fit=crop'
    },
    {
      id: 8,
      name: 'Is This a Pigeon?',
      url: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=500&h=500&fit=crop'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomImage(null);
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        setSelectedTemplate(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = `bold ${fontSize}px Impact, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      if (topText) {
        const topY = 20;
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
      }

      if (bottomText) {
        ctx.textBaseline = 'bottom';
        const bottomY = canvas.height - 20;
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
      }
    };

    img.src = customImage || selectedTemplate?.url || '';
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetMeme = () => {
    setTopText('');
    setBottomText('');
    setSelectedTemplate(null);
    setCustomImage(null);
    setFontSize(40);
    setTextColor('#FFFFFF');
  };

  useEffect(() => {
    if (selectedTemplate || customImage) {
      generateMeme();
    }
  }, [topText, bottomText, selectedTemplate, customImage, fontSize, textColor]);

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Type className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Meme Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Upload Your Image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 transition flex items-center justify-center gap-2 text-indigo-600 font-semibold"
            >
              <Image size={24} />
              Upload Custom Image
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Or Choose a Template</h3>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {memeTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-4 transition ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-600 shadow-lg scale-105'
                      : 'border-transparent hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={template.url}
                    alt={template.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="bg-gray-100 p-2 text-center text-xs font-semibold text-gray-700">
                    {template.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Top Text
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Enter top text..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bottom Text
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Enter bottom text..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateMeme}
              disabled={!selectedTemplate && !customImage}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Generate Meme
            </button>
            <button
              onClick={resetMeme}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Preview</h3>
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[500px]">
            {selectedTemplate || customImage ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Image size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a template or upload an image</p>
                <p className="text-sm">to start creating your meme</p>
              </div>
            )}
          </div>

          {(selectedTemplate || customImage) && (
            <button
              onClick={downloadMeme}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 text-lg"
            >
              <Download size={24} />
              Download Meme
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
        <ul className="space-y-1 text-sm text-indigo-800">
          <li>• Keep text short and impactful for best results</li>
          <li>• White text with black outline works best on most images</li>
          <li>• Upload your own images for custom memes</li>
          <li>• Adjust font size if text doesn't fit properly</li>
        </ul>
      </div>
    </div>
  );
};

export default MemeGenerator;
