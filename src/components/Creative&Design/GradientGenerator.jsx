import React from 'react'

function GradientGenerator() {
  return (
   <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
    <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <input type="color" defaultValue="#a855f7" className="w-full h-12 rounded cursor-pointer" />
      <input type="color" defaultValue="#ec4899" className="w-full h-12 rounded cursor-pointer" />
    </div>
    <button className="w-full mt-4 p-3 bg-blue-600 text-white rounded-lg font-bold">Copy CSS</button>
  </div>
  )
}

export default GradientGenerator
