import { useState, useRef } from 'react';
import { Palette, Copy, Image, Check, Pipette, Type } from 'lucide-react';

const LoremIpsum = () => {
  const [selectedColor, setSelectedColor] = useState('#374151');
  const [colorHistory, setColorHistory] = useState(['#374151', '#1F2937', '#111827', '#6B7280', '#9CA3AF']);
  const [extractedColors, setExtractedColors] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loremText, setLoremText] = useState(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`);
  
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

  // Copy Lorem Ipsum text
  const copyLoremText = () => {
    navigator.clipboard.writeText(loremText);
    setCopiedIndex('lorem');
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

  // Predefined text color palettes
  const textColorPalettes = [
    { 
      name: 'Gray Scale', 
      colors: ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'] 
    },
    { 
      name: 'Dark Text', 
      colors: ['#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'] 
    },
    { 
      name: 'Warm Gray', 
      colors: ['#292524', '#44403C', '#78716C', '#A8A29E', '#D6D3D1'] 
    },
    { 
      name: 'Cool Gray', 
      colors: ['#1F2937', '#4B5563', '#6B7280', '#9CA3AF', '#E5E7EB'] 
    },
    { 
      name: 'Rich Black', 
      colors: ['#000000', '#171717', '#404040', '#737373', '#A3A3A3'] 
    },
    { 
      name: 'Blue Gray', 
      colors: ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8'] 
    }
  ];

  // Lorem Ipsum variants
  const loremVariants = [
    {
      name: "Classic",
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
    },
    {
      name: "Short",
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`
    },
    {
      name: "Medium",
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.`
    },
    {
      name: "Long",
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.`
    }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Type className="text-gray-700" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Lorem Ipsum & Text Color Picker</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Text Display & Controls */}
        <div className="space-y-6">
          {/* Text Display */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Preview Text</h3>
              <button
                onClick={copyLoremText}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition flex items-center gap-2"
              >
                {copiedIndex === 'lorem' ? <Check size={16} /> : <Copy size={16} />}
                Copy Text
              </button>
            </div>
            <div 
              className="p-6 bg-white rounded-lg border-2 border-gray-200 min-h-[300px] max-h-[400px] overflow-y-auto"
              style={{ color: selectedColor }}
            >
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-lg">
                {loremText}
              </pre>
            </div>
          </div>

          {/* Text Variants */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Text Variants</h3>
            <div className="grid grid-cols-2 gap-3">
              {loremVariants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => setLoremText(variant.text)}
                  className="p-3 bg-white hover:bg-gray-100 rounded-lg border-2 border-gray-200 transition text-left"
                >
                  <div className="font-semibold text-gray-800">{variant.name}</div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {variant.text.split('\n')[0].substring(0, 60)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Info */}
          {colorInfo && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Text Color</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-700">HEX</span>
                  <div className="flex gap-2 items-center">
                    <code className="text-sm font-mono uppercase">
                      {selectedColor}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedColor, 'hex')}
                      className="p-2 hover:bg-gray-100 rounded transition"
                    >
                      {copiedIndex === 'hex' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

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
        </div>

        {/* Right Side - Color Picker & Palettes */}
        <div className="space-y-6">
          {/* Main Color Picker */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Pick Text Color</h3>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">HEX Color</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedColor, 'hex-input')}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        {copiedIndex === 'hex-input' ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Shades */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Text Color Shades</h3>
            <div className="grid grid-cols-11 gap-1 rounded-lg overflow-hidden shadow-lg">
              {shades.map((shade, index) => (
                <div
                  key={index}
                  onClick={() => handleColorChange(shade)}
                  className="h-16 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: shade }}
                  title={shade}
                >
                  {index === 5 && (
                    <span 
                      className="text-xs font-bold"
                      style={{ color: index > 5 ? '#000' : '#fff' }}
                    >
                      Aa
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Text Color Palettes */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Text Color Palettes</h3>
            <div className="space-y-3">
              {textColorPalettes.map((palette, pIndex) => (
                <div key={pIndex} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">{palette.name}</h4>
                  <div className="flex gap-2">
                    {palette.colors.map((color, cIndex) => (
                      <div
                        key={cIndex}
                        onClick={() => handleColorChange(color)}
                        className="flex-1 h-12 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-md flex items-center justify-center"
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        <span 
                          className="text-xs font-bold"
                          style={{ color: cIndex < 3 ? '#fff' : '#000' }}
                        >
                          Aa
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color History */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Text Colors</h3>
            <div className="flex gap-2 flex-wrap">
              {colorHistory.map((color, index) => (
                <div
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="w-12 h-12 rounded-lg cursor-pointer hover:scale-110 transition-transform shadow-md border-2 border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  <span 
                    className="text-xs font-bold"
                    style={{ color: index < 2 ? '#fff' : '#000' }}
                  >
                    Aa
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Random Color Generator */}
          <button
            onClick={() => {
              // Generate random dark colors suitable for text
              const darkColors = [
                '#1F2937', '#374151', '#4B5563', '#6B7280', '#111827',
                '#292524', '#44403C', '#374151', '#334155', '#0F172A'
              ];
              const randomColor = darkColors[Math.floor(Math.random() * darkColors.length)];
              handleColorChange(randomColor);
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-700 to-blue-800 hover:from-gray-800 hover:to-blue-900 text-white rounded-lg font-bold transition text-lg shadow-lg"
          >
            🎲 Generate Random Text Color
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tips for Text Colors:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Choose darker colors for better readability on light backgrounds</li>
          <li>• Use the color shades to find the perfect contrast ratio</li>
          <li>• Copy any color format (HEX, RGB, HSL) with one click</li>
          <li>• Test different text variants with your chosen color</li>
          <li>• Stick to grayscale and dark colors for professional text</li>
        </ul>
      </div>
    </div>
  );
};

export default LoremIpsum;