import { useState, useRef } from 'react';
import { FileText, Upload, Download, Merge, Split, Lock, Unlock, Image, Search, Shield, Zap, Check, Copy, Eye, Trash2, Settings } from 'lucide-react';

const PDFTools = () => {
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [activeTool, setActiveTool] = useState('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Mock PDF tools functionality
  const tools = [
    {
      id: 'merge',
      name: 'Merge PDF',
      description: 'Combine multiple PDF files into one',
      icon: Merge,
      color: 'blue',
      features: ['Combine multiple files', 'Preserve quality', 'Rearrange pages']
    },
    {
      id: 'split',
      name: 'Split PDF',
      description: 'Extract pages or split by sections',
      icon: Split,
      color: 'green',
      features: ['Extract specific pages', 'Split by page ranges', 'Save individual pages']
    },
    // {
    //   id: 'compress',
    //   name: 'Compress PDF',
    //   description: 'Reduce file size without losing quality',
    //   icon: Compress,
    //   color: 'purple',
    //   features: ['Reduce file size', 'Maintain quality', 'Optimize for web']
    // },
    {
      id: 'protect',
      name: 'Protect PDF',
      description: 'Add password and encryption',
      icon: Lock,
      color: 'red',
      features: ['Password protection', 'Encryption', 'Permission control']
    },
    {
      id: 'unlock',
      name: 'Unlock PDF',
      description: 'Remove password protection',
      icon: Unlock,
      color: 'orange',
      features: ['Remove passwords', 'Restrict editing', 'Enable copying']
    },
    {
      id: 'convert-to-image',
      name: 'PDF to Images',
      description: 'Convert PDF pages to image formats',
      icon: Image,
      color: 'pink',
      features: ['Convert to PNG/JPG', 'High resolution', 'Batch processing']
    },
    {
      id: 'ocr',
      name: 'OCR PDF',
      description: 'Extract text from scanned documents',
      icon: Search,
      color: 'indigo',
      features: ['Text recognition', 'Multiple languages', 'Searchable PDF']
    },
    {
      id: 'repair',
      name: 'Repair PDF',
      description: 'Fix corrupted or damaged files',
      icon: Shield,
      color: 'yellow',
      features: ['Fix corruption', 'Recover data', 'Restore functionality']
    }
  ];

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      file: file,
      uploadTime: new Date().toLocaleTimeString(),
      pages: Math.floor(Math.random() * 50) + 1 // Mock page count
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Mock processed files
          const newProcessedFile = {
            id: Date.now(),
            name: `processed_${files[0]?.name || 'document'}.pdf`,
            size: (Math.random() * 2 + 0.5).toFixed(2) + ' MB',
            tool: activeTool,
            processedTime: new Date().toLocaleTimeString()
          };
          
          setProcessedFiles(prev => [newProcessedFile, ...prev]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadFile = (file) => {
    // Mock download functionality
    alert(`Downloading ${file.name}`);
  };

  const clearProcessedFiles = () => {
    setProcessedFiles([]);
  };

  const getToolColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      yellow: 'bg-yellow-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getToolButtonColor = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      red: 'bg-red-600 hover:bg-red-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      pink: 'bg-pink-600 hover:bg-pink-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700'
    };
    return colors[color] || 'bg-gray-600 hover:bg-gray-700';
  };

  // Mock recent operations
  const recentOperations = [
    { id: 1, name: 'merged_documents.pdf', tool: 'merge', time: '2 hours ago', size: '4.2 MB' },
    { id: 2, name: 'compressed_report.pdf', tool: 'compress', time: '1 day ago', size: '1.8 MB' },
    { id: 3, name: 'protected_contract.pdf', tool: 'protect', time: '3 days ago', size: '3.1 MB' }
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="text-red-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Advanced PDF Tools</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Tools */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} />
            PDF Tools
          </h3>
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  activeTool === tool.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getToolColor(tool.color)}`}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{tool.name}</div>
                    <div className="text-sm text-gray-600">{tool.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Tool Details and File Upload */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const tool = tools.find(t => t.id === activeTool);
                const IconComponent = tool?.icon;
                return (
                  <>
                    <div className={`p-2 rounded-lg ${getToolColor(tool?.color)}`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{tool?.name}</h3>
                      <p className="text-gray-600">{tool?.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Upload PDF Files
              </h4>
              <p className="text-gray-500 mb-4">
                Drag & drop files here or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Select Files
              </button>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Selected Files ({files.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-red-500" size={20} />
                        <div>
                          <div className="font-medium text-gray-800">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {file.size} • {file.pages} pages • {file.uploadTime}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {tools.find(t => t.id === activeTool)?.features.map((feature, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Button */}
            <button
              onClick={simulateProcessing}
              disabled={files.length === 0 || isProcessing}
              className={`w-full py-4 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3 ${
                files.length === 0 || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : getToolButtonColor(tools.find(t => t.id === activeTool)?.color)
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Processing... {processingProgress}%
                </>
              ) : (
                <>
                  <Zap size={24} />
                  Process PDF Files
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Processed Files */}
          {processedFiles.length > 0 && (
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Check className="text-green-600" />
                  Processed Files
                </h3>
                <button
                  onClick={clearProcessedFiles}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {processedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600" size={24} />
                      <div>
                        <div className="font-semibold text-gray-800">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {file.size} • {file.tool} • {file.processedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadFile(file)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Layout for Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Operations */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="text-purple-600" />
                Recent Operations
              </h3>
              <div className="space-y-3">
                {recentOperations.map((operation) => (
                  <div key={operation.id} className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">{operation.name}</div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded capitalize">
                        {operation.tool}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{operation.size}</span>
                      <span>{operation.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Tips */}
            <div className="bg-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="text-orange-600" />
                PDF Security Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-1">Password Protection</div>
                  <div className="text-gray-600">Always use strong passwords for sensitive documents</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-1">File Size Optimization</div>
                  <div className="text-gray-600">Compress large files before sharing to save bandwidth</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-1">Watermarking</div>
                  <div className="text-gray-600">Add watermarks to protect intellectual property</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-1">Metadata Removal</div>
                  <div className="text-gray-600">Remove sensitive metadata before sharing files</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Shield className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Secure Processing</div>
          <div className="text-sm text-gray-600">Files are processed locally</div>
        </div>
        <div className="text-center p-4">
          <Zap className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Fast Conversion</div>
          <div className="text-sm text-gray-600">Quick processing times</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">No Watermarks</div>
          <div className="text-sm text-gray-600">Clean, professional results</div>
        </div>
        <div className="text-center p-4">
          <FileText className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">High Quality</div>
          <div className="text-sm text-gray-600">Preserve original quality</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 PDF Tools Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Merge multiple PDFs to create comprehensive documents</li>
          <li>• Compress large PDFs for easier sharing and faster loading</li>
          <li>• Always password-protect sensitive documents</li>
          <li>• Use OCR to make scanned documents searchable and editable</li>
          <li>• Split large PDFs to share specific sections with different people</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFTools;
