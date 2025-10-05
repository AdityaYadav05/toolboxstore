import { useState, useRef } from 'react';
import { Minimize2, Upload, Download, Check, Trash2, ZoomIn, ZoomOut, FileImage } from 'lucide-react';

const ImageCompressor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('jpeg');
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(null);
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setOriginalImage(event.target.result);
        setCompressedImage(null);
        setCompressedSize(0);
        setShowComparison(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!originalImage) return;

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      if (maintainAspect) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const compressed = canvas.toDataURL(mimeType, quality / 100);
      
      setCompressedImage(compressed);
      
      const base64Length = compressed.split(',')[1].length;
      const sizeInBytes = (base64Length * 3) / 4;
      setCompressedSize(sizeInBytes);
    };
    img.src = originalImage;
  };

  const downloadImage = (img, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = img;
    link.click();

    setDownloadFormat(filename);
    setTimeout(() => setDownloadFormat(null), 2000);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(80);
    setFormat('jpeg');
    setMaxWidth(1920);
    setMaxHeight(1080);
    setMaintainAspect(true);
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 && compressedSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  const presets = [
    { name: 'High Quality', quality: 90, width: 3840, height: 2160, desc: 'Best for printing' },
    { name: 'Standard', quality: 80, width: 1920, height: 1080, desc: 'Balanced quality' },
    { name: 'Web Optimized', quality: 70, width: 1280, height: 720, desc: 'Fast loading' },
    { name: 'Email', quality: 60, width: 800, height: 600, desc: 'Small file size' },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Minimize2 className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Image Compressor</h2>
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
                    {showComparison ? 'Comparison' : compressedImage ? 'Compressed' : 'Original'}
                  </h3>
                  {compressedImage && (
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        showComparison ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-gray-100'
                      }`}
                    >
                      {showComparison ? 'Single View' : 'Compare'}
                    </button>
                  )}
                </div>

                <div 
                  className="relative w-full h-96 bg-white rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  {showComparison && compressedImage ? (
                    <div className="flex gap-1 h-full w-full">
                      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={originalImage}
                          alt="Original"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Original: {formatBytes(originalSize)}
                        </div>
                      </div>
                      <div className="w-1 bg-indigo-600"></div>
                      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={compressedImage}
                          alt="Compressed"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Compressed: {formatBytes(compressedSize)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={compressedImage || originalImage}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
              </div>

              {compressedImage && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Compression Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="font-semibold text-gray-700">Original Size</span>
                      <span className="text-indigo-600 font-bold">{formatBytes(originalSize)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="font-semibold text-gray-700">Compressed Size</span>
                      <span className="text-purple-600 font-bold">{formatBytes(compressedSize)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <span className="font-semibold text-gray-700">Saved</span>
                      <span className="text-green-600 font-bold text-lg">
                        {compressionRatio}% ({formatBytes(originalSize - compressedSize)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={compressImage}
                  className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Minimize2 size={20} />
                  Compress Image
                </button>

                <button
                  onClick={resetAll}
                  className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Reset All
                </button>
              </div>

              {compressedImage && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Download</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => downloadImage(compressedImage, `compressed.${format}`)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
                    >
                      {downloadFormat === `compressed.${format}` ? <Check size={20} /> : <Download size={20} />}
                      Compressed
                    </button>
                    <button
                      onClick={() => downloadImage(originalImage, `original.${format}`)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
                    >
                      {downloadFormat === `original.${format}` ? <Check size={20} /> : <Download size={20} />}
                      Original
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setQuality(preset.quality);
                    setMaxWidth(preset.width);
                    setMaxHeight(preset.height);
                  }}
                  className="p-4 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg transition text-left"
                >
                  <p className="font-bold text-gray-800 mb-1">{preset.name}</p>
                  <p className="text-xs text-gray-600">{preset.desc}</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {preset.width}x{preset.height} • {preset.quality}%
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Compression Settings</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`p-3 rounded-lg font-semibold transition ${
                      format === 'jpeg'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    onClick={() => setFormat('png')}
                    className={`p-3 rounded-lg font-semibold transition ${
                      format === 'png'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    PNG
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Smaller</span>
                  <span>Better</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Width: {maxWidth}px
                </label>
                <input
                  type="range"
                  min="320"
                  max="3840"
                  step="10"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Height: {maxHeight}px
                </label>
                <input
                  type="range"
                  min="240"
                  max="2160"
                  step="10"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <label htmlFor="aspectRatio" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Maintain Aspect Ratio
                </label>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg">
            <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-1 text-sm text-indigo-800">
              <li>• Use JPEG for photos and PNG for graphics with transparency</li>
              <li>• Quality 70-80% is usually ideal for web use</li>
              <li>• Lower resolution for faster page loading</li>
              <li>• Compare before and after to ensure quality</li>
              <li>• Maintain aspect ratio to avoid distortion</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-2">📊 Use Cases:</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Website optimization for faster loading</li>
              <li>• Email attachments under size limits</li>
              <li>• Social media uploads</li>
              <li>• Cloud storage space saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
