import { useState, useRef } from 'react';
import { Sparkles, Download, Type, Palette, Circle, Square, Triangle, Star, Heart, Zap, Copy, Check } from 'lucide-react';

const LogoMaker = () => {
  const [logoText, setLogoText] = useState('YOUR LOGO');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#3B82F6');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [shape, setShape] = useState('none');
  const [shapeColor, setShapeColor] = useState('#8B5CF6');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('bold');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const canvasRef = useRef(null);

  const shapes = [
    { id: 'none', name: 'None', icon: Circle },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'square', name: 'Square', icon: Square },
    { id: 'triangle', name: 'Triangle', icon: Triangle },
    { id: 'star', name: 'Star', icon: Star },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'hexagon', name: 'Hexagon', icon: Zap }
  ];

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black'
  ];

  const colorPalettes = [
    { name: 'Primary', colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'] },
    { name: 'Success', colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'] },
    { name: 'Warning', colors: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'] },
    { name: 'Danger', colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'] },
    { name: 'Purple', colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'] },
    { name: 'Neutral', colors: ['#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'] }
  ];

  const renderShape = (shapeId, color) => {
    const shapeStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    switch (shapeId) {
      case 'circle':
        return (
          <div style={{
            ...shapeStyle,
            backgroundColor: color,
            borderRadius: '50%'
          }} />
        );
      case 'square':
        return (
          <div style={{
            ...shapeStyle,
            backgroundColor: color,
            borderRadius: '12px'
          }} />
        );
      case 'triangle':
        return (
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '100px solid transparent',
            borderRight: '100px solid transparent',
            borderBottom: `173px solid ${color}`,
            margin: '0 auto'
          }} />
        );
      case 'star':
        return (
          <div style={{ ...shapeStyle, position: 'relative' }}>
            <Star size={200} fill={color} color={color} />
          </div>
        );
      case 'heart':
        return (
          <div style={{ ...shapeStyle, position: 'relative' }}>
            <Heart size={180} fill={color} color={color} />
          </div>
        );
      case 'hexagon':
        return (
          <div style={{
            width: '200px',
            height: '115px',
            backgroundColor: color,
            position: 'relative',
            margin: '58px auto'
          }}>
            <div style={{
              position: 'absolute',
              top: '-58px',
              left: 0,
              width: 0,
              height: 0,
              borderLeft: '100px solid transparent',
              borderRight: '100px solid transparent',
              borderBottom: `58px solid ${color}`
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-58px',
              left: 0,
              width: 0,
              height: 0,
              borderLeft: '100px solid transparent',
              borderRight: '100px solid transparent',
              borderTop: `58px solid ${color}`
            }} />
          </div>
        );
      default:
        return null;
    }
  };

  const downloadLogo = (format) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 3;
    canvas.width = 600 * scale;
    canvas.height = 400 * scale;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 600, 400);

    // Shape
    if (shape !== 'none') {
      ctx.save();
      ctx.translate(300, 200);
      ctx.fillStyle = shapeColor;
      
      switch (shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, 150, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-150, -150, 300, 300);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -130);
          ctx.lineTo(-150, 130);
          ctx.lineTo(150, 130);
          ctx.closePath();
          ctx.fill();
          break;
      }
      ctx.restore();
    }

    // Text
    ctx.save();
    ctx.translate(300, 200);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (letterSpacing !== 0) {
      let x = -ctx.measureText(logoText).width / 2;
      for (let i = 0; i < logoText.length; i++) {
        ctx.fillText(logoText[i], x, 0);
        x += ctx.measureText(logoText[i]).width + letterSpacing;
      }
    } else {
      ctx.fillText(logoText, 0, 0);
    }
    ctx.restore();

    const link = document.createElement('a');
    link.download = `logo.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();

    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyAsDataURL = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 600, 400);

    if (shape !== 'none') {
      ctx.save();
      ctx.translate(300, 200);
      ctx.fillStyle = shapeColor;
      
      switch (shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, 150, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-150, -150, 300, 300);
          break;
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(300, 200);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(logoText, 0, 0);
    ctx.restore();

    navigator.clipboard.writeText(canvas.toDataURL());
    setCopiedFormat('url');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Logo Maker & Designer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Logo Preview */}
        <div className="space-y-6">
          {/* Logo Preview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Logo Preview</h3>
            <div
              className="w-full h-80 rounded-lg shadow-lg overflow-hidden relative flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              {shape !== 'none' && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {renderShape(shape, shapeColor)}
                </div>
              )}
              <div
                className="relative z-10"
                style={{
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  fontWeight: fontWeight,
                  letterSpacing: `${letterSpacing}px`,
                  transform: `rotate(${rotation}deg)`,
                  textAlign: 'center',
                  maxWidth: '90%',
                  wordBreak: 'break-word'
                }}
              >
                {logoText}
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Export Logo</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => downloadLogo('png')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                {copiedFormat === 'png' ? <Check size={20} /> : <Download size={20} />}
                PNG
              </button>
              <button
                onClick={() => downloadLogo('jpeg')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                {copiedFormat === 'jpeg' ? <Check size={20} /> : <Download size={20} />}
                JPEG
              </button>
              <button
                onClick={copyAsDataURL}
                className="col-span-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                {copiedFormat === 'url' ? <Check size={20} /> : <Copy size={20} />}
                Copy as Data URL
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTextColor('#FFFFFF');
                  setBgColor('#000000');
                  setShape('circle');
                  setShapeColor('#3B82F6');
                }}
                className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                Modern Blue
              </button>
              <button
                onClick={() => {
                  setTextColor('#000000');
                  setBgColor('#FFFFFF');
                  setShape('square');
                  setShapeColor('#F59E0B');
                }}
                className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                Bold Orange
              </button>
              <button
                onClick={() => {
                  setTextColor('#FFFFFF');
                  setBgColor('#1E293B');
                  setShape('none');
                  setShapeColor('#8B5CF6');
                }}
                className="p-4 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                Minimalist
              </button>
              <button
                onClick={() => {
                  setTextColor('#EC4899');
                  setBgColor('#FFFFFF');
                  setShape('heart');
                  setShapeColor('#FFC0CB');
                }}
                className="p-4 bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                Vibrant Pink
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="space-y-6">
          {/* Text Input */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Type size={24} />
              Logo Text
            </h3>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg font-semibold"
              placeholder="Enter your logo text..."
            />
          </div>

          {/* Font Settings */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Font Settings</h3>
            <div className="space-y-4">
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
                    <option key={font} value={font} style={{ fontFamily: font }}>
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
                  min="20"
                  max="100"
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
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {weight === '900' ? 'Black' : weight.charAt(0).toUpperCase() + weight.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Letter Spacing: {letterSpacing}px
                </label>
                <input
                  type="range"
                  min="-5"
                  max="20"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rotation: {rotation}°
                </label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette size={24} />
              Colors
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
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
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
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

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shape Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={shapeColor}
                      onChange={(e) => setShapeColor(e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={shapeColor}
                      onChange={(e) => setShapeColor(e.target.value)}
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg font-mono uppercase focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shapes */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Background Shape</h3>
            <div className="grid grid-cols-4 gap-3">
              {shapes.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                      shape === s.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    <Icon size={24} className={shape === s.id ? 'text-indigo-600' : 'text-gray-600'} />
                    <span className="text-xs font-semibold">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Color Palettes</h3>
            <div className="space-y-3">
              {colorPalettes.map((palette, pIndex) => (
                <div key={pIndex} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">{palette.name}</h4>
                  <div className="flex gap-2">
                    {palette.colors.map((color, cIndex) => (
                      <div
                        key={cIndex}
                        onClick={() => setTextColor(color)}
                        className="flex-1 h-10 rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-md"
                        style={{ backgroundColor: color }}
                        title={`Set text to ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
        <ul className="space-y-1 text-sm text-indigo-800">
          <li>• Experiment with different font combinations for unique styles</li>
          <li>• Use contrasting colors for better readability</li>
          <li>• Try the quick presets for instant professional looks</li>
          <li>• Export as PNG for transparent backgrounds in design tools</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoMaker;
