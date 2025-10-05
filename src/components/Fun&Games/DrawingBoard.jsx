import { useState, useEffect, useRef } from 'react';
import { Palette, RotateCcw, Download, Upload, Save, Trash2, Settings, ZoomIn, ZoomOut, Minus, Circle, Square, Type, Image, MousePointer, Eraser, Brush, Move } from 'lucide-react';

const DrawingBoard = () => {
  const [drawing, setDrawing] = useState({
    elements: [],
    currentTool: 'brush',
    color: '#3b82f6',
    brushSize: 5,
    backgroundColor: '#ffffff'
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    animations: true,
    grid: false,
    snapToGrid: false,
    pressureSensitivity: false
  });

  const [state, setState] = useState({
    isDrawing: false,
    currentElement: null,
    scale: 1,
    panOffset: { x: 0, y: 0 },
    isPanning: false,
    lastPanPoint: { x: 0, y: 0 },
    selectedElement: null,
    history: [],
    historyIndex: -1
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Blue Sketch',
      elements: [],
      settings: {
        color: '#3b82f6',
        brushSize: 3,
        backgroundColor: '#f8fafc'
      }
    },
    {
      id: 2,
      name: 'Red Draft',
      elements: [],
      settings: {
        color: '#ef4444',
        brushSize: 2,
        backgroundColor: '#ffffff'
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState('draw');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer },
    { id: 'brush', name: 'Brush', icon: Brush },
    { id: 'eraser', name: 'Eraser', icon: Eraser },
    { id: 'line', name: 'Line', icon: Minus },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'pan', name: 'Pan', icon: Move }
  ];

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f59e0b', '#84cc16', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#dc2626', '#ea580c',
    '#65a30d', '#059669', '#0ea5e9', '#7c3aed', '#db2777', '#57534e'
  ];

  const brushSizes = [1, 2, 3, 5, 8, 13, 21, 34];

  // Initialize from localStorage
  useEffect(() => {
    const savedDrawing = localStorage.getItem('drawingBoardData');
    const savedSettings = localStorage.getItem('drawingBoardSettings');
    const savedPresets = localStorage.getItem('drawingBoardPresets');
    const savedState = localStorage.getItem('drawingBoardState');
    
    if (savedDrawing) setDrawing(JSON.parse(savedDrawing));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setState(prev => ({ ...prev, ...parsedState }));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('drawingBoardData', JSON.stringify(drawing));
    localStorage.setItem('drawingBoardSettings', JSON.stringify(settings));
    localStorage.setItem('drawingBoardPresets', JSON.stringify(presets));
    localStorage.setItem('drawingBoardState', JSON.stringify({
      scale: state.scale,
      panOffset: state.panOffset,
      historyIndex: state.historyIndex
    }));
  }, [drawing, settings, presets, state.scale, state.panOffset, state.historyIndex]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    drawCanvas(ctx);
  }, [drawing, state.scale, state.panOffset, settings.grid]);

  // Draw everything on canvas
  const drawCanvas = (ctx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas
    ctx.fillStyle = drawing.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(state.panOffset.x, state.panOffset.y);
    ctx.scale(state.scale, state.scale);

    // Draw grid
    if (settings.grid) {
      drawGrid(ctx);
    }

    // Draw elements
    drawing.elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current element being drawn
    if (state.currentElement) {
      drawElement(ctx, state.currentElement);
    }

    // Draw selection
    if (state.selectedElement) {
      drawSelection(ctx, state.selectedElement);
    }

    ctx.restore();
  };

  // Draw grid
  const drawGrid = (ctx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gridSize = 20;
    const startX = -state.panOffset.x % (gridSize * state.scale);
    const startY = -state.panOffset.y % (gridSize * state.scale);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = startX; x < canvas.width; x += gridSize * state.scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < canvas.height; y += gridSize * state.scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  // Draw individual element
  const drawElement = (ctx, element) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'brush':
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;

      case 'eraser':
        ctx.strokeStyle = drawing.backgroundColor;
        ctx.lineWidth = element.brushSize * 2;
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.start.x, element.start.y);
        ctx.lineTo(element.end.x, element.end.y);
        ctx.stroke();
        break;

      case 'rectangle':
        ctx.beginPath();
        const rectWidth = element.end.x - element.start.x;
        const rectHeight = element.end.y - element.start.y;
        ctx.rect(element.start.x, element.start.y, rectWidth, rectHeight);
        ctx.stroke();
        break;

      case 'circle':
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(element.end.x - element.start.x, 2) + 
          Math.pow(element.end.y - element.start.y, 2)
        );
        ctx.arc(element.start.x, element.start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${element.brushSize * 4}px Arial`;
        ctx.fillText(element.text, element.position.x, element.position.y);
        break;
    }
  };

  // Draw selection box
  const drawSelection = (ctx, element) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    switch (element.type) {
      case 'brush':
      case 'eraser':
        const bounds = getElementBounds(element);
        ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.start.x, element.start.y);
        ctx.lineTo(element.end.x, element.end.y);
        ctx.stroke();
        break;

      case 'rectangle':
        const rectWidth = element.end.x - element.start.x;
        const rectHeight = element.end.y - element.start.y;
        ctx.strokeRect(element.start.x, element.start.y, rectWidth, rectHeight);
        break;

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(element.end.x - element.start.x, 2) + 
          Math.pow(element.end.y - element.start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(element.start.x, element.start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${element.brushSize * 4}px Arial`;
        const metrics = ctx.measureText(element.text);
        ctx.strokeRect(
          element.position.x - 5, 
          element.position.y - metrics.actualBoundingBoxAscent - 5,
          metrics.width + 10, 
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 10
        );
        break;
    }

    ctx.setLineDash([]);
  };

  // Get bounds of freehand element
  const getElementBounds = (element) => {
    if (!element.points || element.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    element.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - state.panOffset.x) / state.scale,
      y: (e.clientY - rect.top - state.panOffset.y) / state.scale
    };
  };

  // Mouse down handler
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    if (drawing.currentTool === 'pan') {
      setState(prev => ({
        ...prev,
        isPanning: true,
        lastPanPoint: { x: e.clientX, y: e.clientY }
      }));
      return;
    }

    if (drawing.currentTool === 'select') {
      // Check if clicked on an element
      const clickedElement = findElementAtPos(pos);
      setState(prev => ({ ...prev, selectedElement: clickedElement }));
      return;
    }

    if (drawing.currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const textElement = {
          id: Date.now(),
          type: 'text',
          text,
          position: pos,
          color: drawing.color,
          brushSize: drawing.brushSize
        };
        addToHistory();
        setDrawing(prev => ({
          ...prev,
          elements: [...prev.elements, textElement]
        }));
      }
      return;
    }

    setState(prev => ({ ...prev, isDrawing: true }));

    const newElement = {
      id: Date.now(),
      type: drawing.currentTool,
      color: drawing.currentTool === 'eraser' ? drawing.backgroundColor : drawing.color,
      brushSize: drawing.brushSize,
      points: drawing.currentTool === 'brush' || drawing.currentTool === 'eraser' ? [pos] : [],
      start: pos,
      end: pos
    };

    setState(prev => ({ ...prev, currentElement: newElement }));
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    if (state.isPanning) {
      const deltaX = e.clientX - state.lastPanPoint.x;
      const deltaY = e.clientY - state.lastPanPoint.y;
      
      setState(prev => ({
        ...prev,
        panOffset: {
          x: prev.panOffset.x + deltaX,
          y: prev.panOffset.y + deltaY
        },
        lastPanPoint: { x: e.clientX, y: e.clientY }
      }));
      return;
    }

    if (!state.isDrawing || !state.currentElement) return;

    if (drawing.currentTool === 'brush' || drawing.currentTool === 'eraser') {
      setState(prev => ({
        ...prev,
        currentElement: {
          ...prev.currentElement,
          points: [...prev.currentElement.points, pos]
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        currentElement: {
          ...prev.currentElement,
          end: pos
        }
      }));
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (state.isPanning) {
      setState(prev => ({ ...prev, isPanning: false }));
      return;
    }

    if (!state.isDrawing || !state.currentElement) return;

    addToHistory();
    
    setDrawing(prev => ({
      ...prev,
      elements: [...prev.elements, state.currentElement]
    }));

    setState(prev => ({ 
      ...prev, 
      isDrawing: false, 
      currentElement: null 
    }));
  };

  // Find element at position
  const findElementAtPos = (pos) => {
    for (let i = drawing.elements.length - 1; i >= 0; i--) {
      const element = drawing.elements[i];
      if (isPointInElement(pos, element)) {
        return element;
      }
    }
    return null;
  };

  // Check if point is in element
  const isPointInElement = (pos, element) => {
    const tolerance = 10;

    switch (element.type) {
      case 'brush':
      case 'eraser':
        for (let i = 0; i < element.points.length - 1; i++) {
          const p1 = element.points[i];
          const p2 = element.points[i + 1];
          if (distanceToLine(pos, p1, p2) < tolerance) {
            return true;
          }
        }
        return false;

      case 'line':
        return distanceToLine(pos, element.start, element.end) < tolerance;

      case 'rectangle':
        const minX = Math.min(element.start.x, element.end.x);
        const maxX = Math.max(element.start.x, element.end.x);
        const minY = Math.min(element.start.y, element.end.y);
        const maxY = Math.max(element.start.y, element.end.y);
        return pos.x >= minX - tolerance && pos.x <= maxX + tolerance && 
               pos.y >= minY - tolerance && pos.y <= maxY + tolerance;

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(element.end.x - element.start.x, 2) + 
          Math.pow(element.end.y - element.start.y, 2)
        );
        const distance = Math.sqrt(
          Math.pow(pos.x - element.start.x, 2) + 
          Math.pow(pos.y - element.start.y, 2)
        );
        return Math.abs(distance - radius) < tolerance;

      case 'text':
        // Simple bounding box check for text
        return pos.x >= element.position.x - tolerance && 
               pos.x <= element.position.x + 100 && // Approximate width
               pos.y >= element.position.y - 20 && 
               pos.y <= element.position.y + 5;

      default:
        return false;
    }
  };

  // Calculate distance from point to line
  const distanceToLine = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Add to history for undo/redo
  const addToHistory = () => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...drawing.elements]);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  };

  // Undo
  const undo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({ ...prev, historyIndex: newIndex }));
      setDrawing(prev => ({ ...prev, elements: state.history[newIndex] }));
    }
  };

  // Redo
  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({ ...prev, historyIndex: newIndex }));
      setDrawing(prev => ({ ...prev, elements: state.history[newIndex] }));
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    addToHistory();
    setDrawing(prev => ({ ...prev, elements: [] }));
    setState(prev => ({ ...prev, selectedElement: null }));
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!state.selectedElement) return;
    
    addToHistory();
    setDrawing(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== state.selectedElement.id)
    }));
    setState(prev => ({ ...prev, selectedElement: null }));
  };

  // Change tool
  const changeTool = (toolId) => {
    setDrawing(prev => ({ ...prev, currentTool: toolId }));
    setState(prev => ({ ...prev, selectedElement: null }));
  };

  // Change color
  const changeColor = (color) => {
    setDrawing(prev => ({ ...prev, color }));
  };

  // Change brush size
  const changeBrushSize = (size) => {
    setDrawing(prev => ({ ...prev, brushSize: size }));
  };

  // Change background color
  const changeBackgroundColor = (color) => {
    setDrawing(prev => ({ ...prev, backgroundColor: color }));
  };

  // Zoom in
  const zoomIn = () => {
    setState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  };

  // Zoom out
  const zoomOut = () => {
    setState(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.2) }));
  };

  // Reset zoom and pan
  const resetView = () => {
    setState(prev => ({ 
      ...prev, 
      scale: 1, 
      panOffset: { x: 0, y: 0 } 
    }));
  };

  // Export as image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Save as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: Date.now(),
      name,
      elements: [...drawing.elements],
      settings: {
        color: drawing.color,
        brushSize: drawing.brushSize,
        backgroundColor: drawing.backgroundColor
      }
    };

    setPresets(prev => [newPreset, ...prev]);
  };

  // Load preset
  const loadPreset = (preset) => {
    addToHistory();
    setDrawing(prev => ({
      ...prev,
      elements: preset.elements.map(el => ({ ...el, id: Date.now() + Math.random() })),
      color: preset.settings.color,
      brushSize: preset.settings.brushSize,
      backgroundColor: preset.settings.backgroundColor
    }));
    setActiveTab('draw');
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Update settings
  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Get theme colors
  const getThemeColors = () => {
    const themes = {
      blue: { primary: 'blue', bg: 'blue', text: 'blue' },
      green: { primary: 'green', bg: 'green', text: 'green' },
      purple: { primary: 'purple', bg: 'purple', text: 'purple' },
      orange: { primary: 'orange', bg: 'orange', text: 'orange' }
    };
    return themes[settings.theme] || themes.blue;
  };

  const theme = getThemeColors();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Palette className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Drawing Board</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Navigation */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="p-2">
              {[
                { id: 'draw', name: 'Drawing Board', icon: Palette },
                { id: 'presets', name: 'Presets', icon: Save },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeTab === item.id 
                        ? `bg-${theme.primary}-100 text-${theme.primary}-800` 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={16} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`bg-${theme.primary}-50 p-4 rounded-xl`}>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={exportImage}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export Image
              </button>
              <button
                onClick={clearCanvas}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear Canvas
              </button>
              <button
                onClick={resetView}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset View
              </button>
            </div>
          </div>

          {/* Canvas Info */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Canvas Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Elements:</span>
                <span className="font-bold text-gray-800">{drawing.elements.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zoom:</span>
                <span className="font-bold text-gray-800">{Math.round(state.scale * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tool:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {drawing.currentTool}
                </span>
              </div>
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">History</h3>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              <button
                onClick={undo}
                disabled={state.historyIndex <= 0}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={state.historyIndex >= state.history.length - 1}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
              >
                Redo
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'draw' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Tools */}
                <div className="flex flex-wrap gap-2">
                  {tools.map(tool => {
                    const IconComponent = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => changeTool(tool.id)}
                        className={`p-3 rounded-lg border-2 transition ${
                          drawing.currentTool === tool.id
                            ? `border-${theme.primary}-500 bg-${theme.primary}-100 text-${theme.primary}-700`
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                        title={tool.name}
                      >
                        <IconComponent size={20} />
                      </button>
                    );
                  })}
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Color:</span>
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => changeColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          drawing.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Size:</span>
                  <select
                    value={drawing.brushSize}
                    onChange={(e) => changeBrushSize(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    {brushSizes.map(size => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700 min-w-12 text-center">
                    {Math.round(state.scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>

                {/* Background Color */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">BG:</span>
                  <div className="flex gap-1">
                    {['#ffffff', '#f8fafc', '#000000', '#3b82f6'].map(color => (
                      <button
                        key={color}
                        onClick={() => changeBackgroundColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          drawing.backgroundColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas Container */}
              <div 
                ref={containerRef}
                className="relative bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden"
                style={{ height: '600px' }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="absolute inset-0 cursor-crosshair"
                />
                
                {/* Canvas Overlay Info */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  {drawing.currentTool === 'pan' ? 'Panning Mode - Click and drag to move' :
                   drawing.currentTool === 'select' ? 'Selection Mode - Click to select elements' :
                   `Drawing with ${drawing.currentTool} - Click and drag to draw`}
                </div>

                {/* Selected Element Controls */}
                {state.selectedElement && (
                  <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={deleteSelected}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setState(prev => ({ ...prev, selectedElement: null }))}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                      >
                        Deselect
                      </button>
                    </div>
                    <div className="text-xs text-gray-600">
                      Selected: {state.selectedElement.type}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawing Stats */}
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                  <div className="text-lg font-bold text-blue-600">{drawing.elements.length}</div>
                  <div className="text-sm text-blue-800">Total Elements</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {drawing.elements.filter(el => el.type === 'brush').length}
                  </div>
                  <div className="text-sm text-green-800">Brush Strokes</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
                  <div className="text-lg font-bold text-purple-600">
                    {drawing.elements.filter(el => el.type !== 'brush' && el.type !== 'eraser').length}
                  </div>
                  <div className="text-sm text-purple-800">Shapes</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(state.scale * 100)}%
                  </div>
                  <div className="text-sm text-orange-800">Zoom Level</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Drawing Presets</h3>
                <button
                  onClick={saveAsPreset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Current as Preset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">{preset.name}</h4>
                      <button
                        onClick={() => removePreset(preset.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {preset.elements.length} elements
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: preset.settings.color,
                          color: preset.settings.color === '#000000' ? 'white' : 'black'
                        }}
                      >
                        Color
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        Size: {preset.settings.brushSize}px
                      </span>
                      <span 
                        className="px-2 py-1 rounded text-xs border"
                        style={{ backgroundColor: preset.settings.backgroundColor }}
                      >
                        BG
                      </span>
                    </div>
                    <button
                      onClick={() => loadPreset(preset)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      Load Preset
                    </button>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No presets saved yet</div>
                    <div className="text-sm">Save your current drawing as a preset</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="text-gray-600" />
                Drawing Settings
              </h3>
              
              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Theme Color</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['blue', 'green', 'purple', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateSettings('theme', color)}
                        className={`p-4 rounded-lg border-2 transition ${
                          settings.theme === color 
                            ? `border-${color}-500 bg-${color}-100` 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-${color}-500 mx-auto`}></div>
                        <div className="text-sm mt-2 capitalize">{color}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Grid</h4>
                    <button
                      onClick={() => updateSettings('grid', !settings.grid)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.grid 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Square size={16} />
                      Grid {settings.grid ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Snap to Grid</h4>
                    <button
                      onClick={() => updateSettings('snapToGrid', !settings.snapToGrid)}
                      disabled={!settings.grid}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.snapToGrid 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      } ${!settings.grid ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Move size={16} />
                      Snap {settings.snapToGrid ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Other Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Animations</h4>
                    <button
                      onClick={() => updateSettings('animations', !settings.animations)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.animations 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Palette size={16} />
                      Animations {settings.animations ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Pressure Sensitivity</h4>
                    <button
                      onClick={() => updateSettings('pressureSensitivity', !settings.pressureSensitivity)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.pressureSensitivity 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Brush size={16} />
                      Pressure {settings.pressureSensitivity ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Undo</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + Z</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Redo</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + Y</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Clear Canvas</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + Delete</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoom In</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + +</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoom Out</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + -</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Reset View</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + 0</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Brush className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Tools</div>
          <div className="text-sm text-gray-600">Brush, shapes, text, and more</div>
        </div>
        <div className="text-center p-4">
          <ZoomIn className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Zoom & Pan</div>
          <div className="text-sm text-gray-600">Detailed work with easy navigation</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets</div>
          <div className="text-sm text-gray-600">Save and load your styles</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Export</div>
          <div className="text-sm text-gray-600">Save your artwork as PNG</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎨 Drawing Board Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use the <strong>Brush tool</strong> for freehand drawing and sketching</li>
          <li>• Create perfect <strong>shapes</strong> with the Line, Rectangle, and Circle tools</li>
          <li>• <strong>Zoom and pan</strong> for detailed work - use mouse wheel to zoom, middle click to pan</li>
          <li>• Enable the <strong>grid</strong> for precise alignment and measurements</li>
          <li>• Use <strong>Undo/Redo</strong> (Ctrl+Z/Ctrl+Y) to easily correct mistakes</li>
          <li>• Save your favorite color and brush combinations as <strong>presets</strong> for quick access</li>
          <li>• Export your artwork as <strong>PNG images</strong> to share or print</li>
        </ul>
      </div>
    </div>
  );
};

export default DrawingBoard;