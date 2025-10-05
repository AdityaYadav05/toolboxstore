import { useState } from "react";


function WordCounter() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." 
        className="w-full h-64 p-4 border-2 rounded-lg resize-none focus:border-blue-500 focus:outline-none" />
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600">{words}</div>
          <div className="text-gray-600">Words</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">{chars}</div>
          <div className="text-gray-600">Characters</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600">{Math.ceil(words/200)}</div>
          <div className="text-gray-600">Min Read</div>
        </div>
      </div>
    </div>
  );
}

export default WordCounter
