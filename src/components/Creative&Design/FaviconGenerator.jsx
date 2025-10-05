import { useState, useRef } from 'react';
import { Sparkles, Download, Type, Palette, Upload, Check, Grid3x3, FileImage } from 'lucide-react';

const FaviconGenerator = () => {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('F');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#3B82F6');
  const [bgStyle, setBgStyle] = useState('solid');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('bold');
  const [borderRadius, setBorderRadius] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState(null);
  const fileInputRef = useRef(null);

  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'];

  const bgStyles = [
    { id: 'solid', name: 'Solid' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'radial', name: 'Radial' }
  ];

  const sizes = [
    { name: '16x16', size: 16, desc: 'Browser tab' },
    { name: '32x32', size: 32, desc: 'Taskbar' },
    { name: '48x48', size: 48, desc: 'Desktop' },
    { name: '64x64', size: 64, desc: 'High DPI' },
    { name: '128x128', size: 128, desc: 'Touch icon' },
    { name: '256x256', size: 256, desc: 'High res' }
  ];

  const colorPalettes = [
    { name: 'Blue', colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'] },
    { name: 'Purple', colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'] },
    { name: 'Green', colors: ['#10B981', '#059669', '#047857', '#065F46'] },
    { name: 'Red', colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'] },
    { name: 'Orange', colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'] },
    { name: 'Pink', colors: ['#EC4899', '#DB2777', '#BE185D', '#9D174D'] }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setMode('image');
    };
    reader.readAsDataURL(file);
  };

  const getBackgroundStyle = () => {
    switch (bgStyle) {
      case 'gradient':
        return `linear-gradient(135deg, ${bgColor}, ${adjustColor(bgColor, -30)})`;
      case 'radial':
        return `radial-gradient(circle, ${adjustColor(bgColor, 20)}, ${bgColor})`;
      default:
        return bgColor;
    }
  };

  const adjustColor = (color, amount) => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  const generateFavicon = (size) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Background
    if (bgStyle === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(1, adjustColor(bgColor, -30));
      ctx.fillStyle = gradient;
    } else if (bgStyle === 'radial') {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, adjustColor(bgColor, 20));
      gradient.addColorStop(1, bgColor);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bgColor;
    }

    if (borderRadius > 0) {
      const radius = (size * borderRadius) / 100;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Content
    if (mode === 'text') {
      const scaledFontSize = (fontSize * size) / 128;
      ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, size / 2, size / 2);
    } else if (mode === 'image' && uploadedImage) {
      const img = new window.Image();
      img.src = uploadedImage;
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    return canvas.toDataURL('image/png');
  };

  const downloadFavicon = (size) => {
    const dataUrl = generateFavicon(size);
    const link = document.createElement('a');
    link.download = `favicon-${size}x${size}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadFormat(`${size}x${size}`);
    setTimeout(() => setDownloadFormat(null), 2000);
  };

  const downloadAllSizes = () => {
    sizes.forEach((sizeInfo, index) => {
      setTimeout(() => {
        downloadFavicon(sizeInfo.size);
      }, index * 200);
    });
  };

  const presets = [
    { name: 'Modern Blue', text: 'M', bg: '#3B82F6', textColor: '#FFFFFF', style: 'gradient' },
    { name: 'Bold Red', text: 'B', bg: '#EF4444', textColor: '#FFFFFF', style: 'solid' },
    { name: 'Purple Wave', text: 'P', bg: '#8B5CF6', textColor: '#FFFFFF', style: 'radial' },
    { name: 'Green Fresh', text: 'G', bg: '#10B981', textColor: '#FFFFFF', style: 'gradient' }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Favicon Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Preview</h3>
            
            <div className="bg-white p-8 rounded-lg shadow-inner flex flex-col items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div
                    className="mb-2 shadow-lg"
                    style={{
                      width: '128px',
                      height: '128px',
                      background: getBackgroundStyle(),
                      borderRadius: `${borderRadius}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textColor,
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                      fontWeight: fontWeight,
                      overflow: 'hidden'
                    }}
                  >
                    {mode === 'text' ? (
                      text
                    ) : mode === 'image' && uploadedImage ? (
                      <img src={uploadedImage} alt="Favicon" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">128x128</span>
                </div>

                <div className="text-center">
                  <div
                    className="mb-2 shadow-lg"
                    style={{
                      width: '64px',
                      height: '64px',
                      background: getBackgroundStyle(),
                      borderRadius: `${borderRadius}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textColor,
                      fontSize: `${fontSize / 2}px`,
                      fontFamily: fontFamily,
                      fontWeight: fontWeight,
                      overflow: 'hidden'
                    }}
                  >
                    {mode === 'text' ? (
                      text
                    ) : mode === 'image' && uploadedImage ? (
                      <img src={uploadedImage} alt="Favicon" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">64x64</span>
                </div>

                <div className="text-center">
                  <div
                    className="mb-2 shadow-lg"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: getBackgroundStyle(),
                      borderRadius: `${borderRadius}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textColor,
                      fontSize: `${fontSize / 4}px`,
                      fontFamily: fontFamily,
                      fontWeight: fontWeight,
                      overflow: 'hidden'
                    }}
                  >
                    {mode === 'text' ? (
                      text
                    ) : mode === 'image' && uploadedImage ? (
                      <img src={uploadedImage} alt="Favicon" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">32x32</span>
                </div>

                <div className="text-center">
                  <div
                    className="mb-2 shadow-lg"
                    style={{
                      width: '16px',
                      height: '16px',
                      background: getBackgroundStyle(),
                      borderRadius: `${borderRadius}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textColor,
                      fontSize: `${fontSize / 8}px`,
                      fontFamily: fontFamily,
                      fontWeight: fontWeight,
                      overflow: 'hidden'
                    }}
                  >
                    {mode === 'text' ? (
                      text
                    ) : mode === 'image' && uploadedImage ? (
                      <img src={uploadedImage} alt="Favicon" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">16x16</span>
                </div>
              </div>

              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-xs text-gray-600">Preview at different sizes</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Download Options</h3>
            <div className="space-y-3">
              <button
                onClick={downloadAllSizes}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download All Sizes
              </button>

              <div className="grid grid-cols-2 gap-2">
                {sizes.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    onClick={() => downloadFavicon(sizeInfo.size)}
                    className="px-4 py-3 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {downloadFormat === `${sizeInfo.size}x${sizeInfo.size}` ? (
                      <Check size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    {sizeInfo.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setText(preset.text);
                    setBgColor(preset.bg);
                    setTextColor(preset.textColor);
                    setBgStyle(preset.style);
                    setMode('text');
                  }}
                  className="p-4 bg-white hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-white font-bold shadow-md"
                      style={{
                        background: preset.style === 'gradient' 
                          ? `linear-gradient(135deg, ${preset.bg}, ${adjustColor(preset.bg, -30)})`
                          : preset.style === 'radial'
                          ? `radial-gradient(circle, ${adjustColor(preset.bg, 20)}, ${preset.bg})`
                          : preset.bg
                      }}
                    >
                      {preset.text}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('text')}
                className={`p-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  mode === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                <Type size={20} />
                Text
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  mode === 'image'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                <FileImage size={20} />
                Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {mode === 'text' && (
            <>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Text Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Favicon Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, 3))}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-center text-2xl font-bold"
                      placeholder="1-3 chars"
                      maxLength={3}
                    />
                    <p className="text-xs text-gray-600 mt-1">Max 3 characters recommended</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="96"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Weight
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['normal', 'bold', '900'].map((weight) => (
                        <button
                          key={weight}
                          onClick={() => setFontWeight(weight)}
                          className={`p-2 rounded-lg font-semibold transition ${
                            fontWeight === weight
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                          }`}
                        >
                          {weight === '900' ? 'Black' : weight.charAt(0).toUpperCase() + weight.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette size={24} />
              Colors
            </h3>
            <div className="space-y-4">
              {mode === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Background Color
                </label>
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
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Style</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Background Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {bgStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setBgStyle(style.id)}
                      className={`p-3 rounded-lg font-semibold transition ${
                        bgStyle === style.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Border Radius: {borderRadius}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Color Palettes</h3>
            <div className="space-y-3">
              {colorPalettes.map((palette) => (
                <div key={palette.name} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">{palette.name}</h4>
                  <div className="flex gap-2">
                    {palette.colors.map((color) => (
                      <div
                        key={color}
                        onClick={() => setBgColor(color)}
                        className="flex-1 h-10 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-md"
                        style={{ backgroundColor: color }}
                        title={`Set background to ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
        <ul className="space-y-1 text-sm text-indigo-800">
          <li>• Keep designs simple and recognizable at small sizes</li>
          <li>• Use high contrast between text and background</li>
          <li>• Test your favicon at 16x16 to ensure clarity</li>
          <li>• Download all sizes for best browser compatibility</li>
          <li>• Use 1-2 characters for better visibility</li>
        </ul>
      </div>
    </div>
  );
};

export default FaviconGenerator;
