import React from 'react'

function QRCodeGenerator() {
  return (
   <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
    <input type="text" placeholder="Enter URL or text" className="w-full p-3 border-2 rounded-lg mb-4" />
    <button className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold">Generate QR Code</button>
    <div className="mt-6 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">QR Code Preview</div>
  </div>
  )
}

export default QRCodeGenerator
