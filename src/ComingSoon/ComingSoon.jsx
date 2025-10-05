import React from 'react'

function ComingSoon({title}) {
  return (
    <>
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-16 rounded-xl shadow-2xl text-white text-center">
    <div className="text-6xl mb-4">🚀</div>
    <h3 className="text-3xl font-bold mb-2">{title}</h3>
    <p className="text-xl opacity-90">Coming Soon!</p>
  </div>
  </>
  )
}

export default ComingSoon
