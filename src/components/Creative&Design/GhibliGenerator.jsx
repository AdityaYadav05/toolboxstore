import React,{useState} from 'react'

function GhibliGenerator() {
    const [images, setImages] = useState([]);
  const ghibliImages = ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'];
  return (
    <>
     <div className="max-w-4xl mx-auto">
      <button onClick={() => setImages([...images, { id: Date.now(), url: ghibliImages[Math.floor(Math.random() * ghibliImages.length)] }])} 
        className="w-full mb-6 p-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg">
        Generate Beautiful Nature Image
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img.id} className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
            <img src={img.url} alt="Nature" className="w-full h-64 object-cover" />
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default GhibliGenerator;
