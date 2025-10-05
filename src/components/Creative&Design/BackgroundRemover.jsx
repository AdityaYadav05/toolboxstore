import { useState, useRef } from 'react';
import { Eraser, Upload, Download, Check, Trash2, ZoomIn, ZoomOut, RotateCw, Image } from 'lucide-react';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tolerance, setTolerance] = useState(30);
  const [zoom, setZoom] = useState(100);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [showComparison, setShowComparison] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setOriginalImage(event.target.result);
        setProcessedImage(null);
        setShowComparison(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = () => {
    if (!originalImage) return;

    setIsProcessing(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const cornerColors = [
        { r: data[0], g: data[1], b: data[2] },
        { r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2] },
        { r: data[(canvas.height - 1) * canvas.width * 4], g: data[(canvas.height - 1) * canvas.width * 4 + 1], b: data[(canvas.height - 1) * canvas.width * 4 + 2] }
      ];

      const bgR = Math.round((cornerColors[0].r + cornerColors[1].r + cornerColors[2].r) / 3);
      const bgG = Math.round((cornerColors[0].g + cornerColors[1].g + cornerColors[2].g) / 3);
      const bgB = Math.round((cornerColors[0].b + cornerColors[1].b + cornerColors[2].b) / 3);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const colorDiff = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        );

        if (colorDiff < tolerance) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = originalImage;
  };

  const downloadImage = (format) => {
    if (!processedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (format !== 'png') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `background-removed.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();

      setDownloadFormat(format);
      setTimeout(() => setDownloadFormat(null), 2000);
    };
    img.src = processedImage;
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setTolerance(30);
    setZoom(100);
    setBgColor('#FFFFFF');
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const presetBackgrounds = [
    { name: 'White', color: '#FFFFFF' },
    { name: 'Black', color: '#000000' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Green', color: '#10B981' },
    { name: 'Purple', color: '#8B5CF6' },
    { name: 'Yellow', color: '#F59E0B' },
    { name: 'Pink', color: '#EC4899' }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Eraser className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Background Remover</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {!originalImage ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-12 border-4 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition flex flex-col items-center justify-center gap-4 text-indigo-600 hover:bg-indigo-50"
              >
                <Upload size={64} />
                <div className="text-center">
                  <p className="text-xl font-bold mb-2">Upload Image</p>
                  <p className="text-sm text-gray-600">Click to select an image or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WebP</p>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {showComparison ? 'Comparison' : processedImage ? 'Result' : 'Original'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                      title="Zoom Out"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                      title="Zoom In"
                    >
                      <ZoomIn size={20} />
                    </button>
                    {processedImage && (
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`p-2 rounded-lg transition ${
                          showComparison ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                        title="Toggle Comparison"
                      >
                        <Image size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div 
                  className="relative w-full h-96 bg-white rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  {showComparison ? (
                    <div className="flex gap-1 h-full w-full">
                      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={originalImage}
                          alt="Original"
                          className="max-h-full max-w-full object-contain"
                          style={{ transform: `scale(${zoom / 100})` }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Original
                        </div>
                      </div>
                      <div className="w-1 bg-indigo-600"></div>
                      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="max-h-full max-w-full object-contain"
                          style={{ transform: `scale(${zoom / 100})` }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Processed
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={processedImage || originalImage}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      style={{ transform: `scale(${zoom / 100})` }}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">Zoom: {zoom}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className={`px-6 py-4 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RotateCw size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eraser size={20} />
                      Remove Background
                    </>
                  )}
                </button>

                <button
                  onClick={resetAll}
                  className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Reset All
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Removal Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tolerance: {tolerance}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Higher values remove more similar colors (may remove parts of subject)
                </p>
              </div>
            </div>
          </div>

          {processedImage && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Export Image</h3>
              <div className="space-y-3">
                <button
                  onClick={() => downloadImage('png')}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
                >
                  {downloadFormat === 'png' ? <Check size={20} /> : <Download size={20} />}
                  Download PNG (Transparent)
                </button>
                <button
                  onClick={() => downloadImage('jpeg')}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
                >
                  {downloadFormat === 'jpeg' ? <Check size={20} /> : <Download size={20} />}
                  Download JPEG
                </button>
                <button
                  onClick={() => downloadImage('webp')}
                  className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
                >
                  {downloadFormat === 'webp' ? <Check size={20} /> : <Download size={20} />}
                  Download WebP
                </button>
              </div>
            </div>
          )}

          {processedImage && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Background Fill Color</h3>
              <p className="text-sm text-gray-600 mb-3">
                Used when exporting as JPEG (JPEG does not support transparency)
              </p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Colors</h4>
                <div className="grid grid-cols-4 gap-2">
                  {presetBackgrounds.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setBgColor(preset.color)}
                      className="h-12 rounded-lg border-2 border-gray-300 hover:border-indigo-500 transition shadow-sm relative group"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50 text-white rounded-lg">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-indigo-50 p-6 rounded-lg">
            <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-1 text-sm text-indigo-800">
              <li>• Works best with images that have solid, uniform backgrounds</li>
              <li>• Start with low tolerance and increase if needed</li>
              <li>• Use PNG format to preserve transparency</li>
              <li>• Toggle comparison view to see before and after results</li>
              <li>• Adjust tolerance after processing for better results</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-2">📸 Best Results With:</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Product photos with white backgrounds</li>
              <li>• Portraits with studio backgrounds</li>
              <li>• Objects with clear edges</li>
              <li>• High contrast between subject and background</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;