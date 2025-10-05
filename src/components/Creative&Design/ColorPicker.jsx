import { useState, useRef } from 'react';
import { Palette, Copy, Image, Check, Pipette } from 'lucide-react';

const ColorPicker = () => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorHistory, setColorHistory] = useState(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']);
  const [extractedColors, setExtractedColors] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Get color info
  const getColorInfo = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl };
  };

  const colorInfo = getColorInfo(selectedColor);

  // Copy to clipboard
  const copyToClipboard = (text, index = null) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Add to history
  const addToHistory = (color) => {
    if (!colorHistory.includes(color)) {
      setColorHistory([color, ...colorHistory.slice(0, 11)]);
    }
  };

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    addToHistory(color);
  };

  // Generate color shades
  const generateShades = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return [];
    
    const shades = [];
    for (let i = 0; i <= 10; i++) {
      const factor = i / 10;
      const r = Math.round(rgb.r + (255 - rgb.r) * (1 - factor));
      const g = Math.round(rgb.g + (255 - rgb.g) * (1 - factor));
      const b = Math.round(rgb.b + (255 - rgb.b) * (1 - factor));
      shades.push(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
    }
    return shades.reverse();
  };

  const shades = generateShades(selectedColor);

  // Handle image upload and color extraction
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setImagePreview(event.target.result);
        extractColorsFromImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Extract colors from image
  const extractColorsFromImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const colorMap = {};

    // Sample every 10th pixel to improve performance
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      colorMap[hex] = (colorMap[hex] || 0) + 1;
    }

    // Get top 12 colors
    const sortedColors = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([color]) => color);

    setExtractedColors(sortedColors);
  };

  // Predefined color palettes
  const colorPalettes = [
    { name: 'Primary', colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'] },
    { name: 'Success', colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'] },
    { name: 'Warning', colors: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'] },
    { name: 'Danger', colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'] },
    { name: 'Purple', colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'] },
    { name: 'Pink', colors: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'] }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Palette className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Color Picker & Palette Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Color Picker */}
        <div className="space-y-6">
          {/* Main Color Picker */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Pick a Color</h3>
            <div className="flex gap-4 items-center justify-center">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-32 h-32 rounded-lg cursor-pointer border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">HEX</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedColor, 'hex')}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      >
                        {copiedIndex === 'hex' ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Info */}
          {colorInfo && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Color Values</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-700">RGB</span>
                  <div className="flex gap-2 items-center">
                    <code className="text-sm font-mono">
                      rgb({colorInfo.rgb.r}, {colorInfo.rgb.g}, {colorInfo.rgb.b})
                    </code>
                    <button
                      onClick={() => copyToClipboard(`rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`, 'rgb')}
                      className="p-2 hover:bg-gray-100 rounded transition"
                    >
                      {copiedIndex === 'rgb' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-700">HSL</span>
                  <div className="flex gap-2 items-center">
                    <code className="text-sm font-mono">
                      hsl({colorInfo.hsl.h}, {colorInfo.hsl.s}%, {colorInfo.hsl.l}%)
                    </code>
                    <button
                      onClick={() => copyToClipboard(`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`, 'hsl')}
                      className="p-2 hover:bg-gray-100 rounded transition"
                    >
                      {copiedIndex === 'hsl' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color Shades */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Color Shades</h3>
            <div className="grid grid-cols-11 gap-1 rounded-lg overflow-hidden shadow-lg">
              {shades.map((shade, index) => (
                <div
                  key={index}
                  onClick={() => handleColorChange(shade)}
                  className="h-16 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: shade }}
                  title={shade}
                />
              ))}
            </div>
          </div>

          {/* Color History */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Colors</h3>
            <div className="flex gap-2 flex-wrap">
              {colorHistory.map((color, index) => (
                <div
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="w-12 h-12 rounded-lg cursor-pointer hover:scale-110 transition-transform shadow-md border-2 border-gray-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Palettes & Image Extraction */}
        <div className="space-y-6">
          {/* Image Color Extraction */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Extract Colors from Image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition flex items-center justify-center gap-2 text-purple-600 font-semibold"
            >
              <Pipette size={24} />
              Upload Image to Extract Colors
            </button>

            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
                {extractedColors.length > 0 && (
                  <div className="grid grid-cols-6 gap-2">
                    {extractedColors.map((color, index) => (
                      <div
                        key={index}
                        onClick={() => handleColorChange(color)}
                        className="aspect-square rounded-lg cursor-pointer hover:scale-110 transition-transform shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Predefined Palettes */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Color Palettes</h3>
            <div className="space-y-3">
              {colorPalettes.map((palette, pIndex) => (
                <div key={pIndex} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">{palette.name}</h4>
                  <div className="flex gap-2">
                    {palette.colors.map((color, cIndex) => (
                      <div
                        key={cIndex}
                        onClick={() => handleColorChange(color)}
                        className="flex-1 h-12 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Random Color Generator */}
          <button
            onClick={() => {
              const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
              handleColorChange(randomColor);
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition text-lg shadow-lg"
          >
            🎲 Generate Random Color
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
        <ul className="space-y-1 text-sm text-indigo-800">
          <li>• Click any color to select it and see all its variations</li>
          <li>• Upload an image to extract its color palette</li>
          <li>• Use the shades to create beautiful gradients</li>
          <li>• Copy any color format with one click</li>
        </ul>
      </div>
    </div>
  );
};

export default ColorPicker;
