import React, { useState, useRef } from 'react';

function PhotoEditor() {
  const [image, setImage] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);

  const canvasRef = useRef(null); // Reference for the canvas element

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Function to download the edited image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png'); // Get the canvas image as data URL
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'edited-image.png'; // Name of the downloaded file
    link.click();
  };

  // Function to draw the image on the canvas with applied filters
  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0);
    };
  };

  // Re-render the canvas when image or filters change
  React.useEffect(() => {
    if (image) {
      drawImageOnCanvas();
    }
  }, [image, brightness, contrast, blur]);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* File input for image upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="text-white mb-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500"
        />

        {image && (
          <>
            <div className="mb-6 space-y-4">
              {/* Brightness control */}
              <div>
                <label className="block mb-2 font-semibold">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Contrast control */}
              <div>
                <label className="block mb-2 font-semibold">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Blur control */}
              <div>
                <label className="block mb-2 font-semibold">
                  Blur: {blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Canvas for displaying the edited image */}
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>

            {/* Download Button */}
            <button
              onClick={downloadImage}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download Edited Image
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default PhotoEditor;
