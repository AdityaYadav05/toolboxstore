import React from 'react'
import { useState } from 'react';

function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    setPassword(Array.from({length: 16}, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="p-4 bg-gray-100 rounded-lg mb-4 text-center text-2xl font-mono break-all">{password || 'Click Generate'}</div>
      <button onClick={generate} className="w-full p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Generate Secure Password</button>
    </div>
  );

}

export default PasswordGenerator
