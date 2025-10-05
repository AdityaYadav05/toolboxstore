import React from 'react'
import {useState} from 'react'


function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);

  const calculateAge = () => {
    if(!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if(days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if(months < 0) { years--; months += 12; }
    setAge({ years, months, days });
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-xl shadow-2xl text-white">
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-3 rounded-lg mb-4 text-gray-800 font-semibold" />
      <button onClick={calculateAge} className="w-full p-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition">Calculate Age</button>
      {age && (
        <div className="mt-6 text-center">
          <div className="text-5xl font-bold mb-2">{age.years}</div>
          <div className="text-2xl mb-4">Years Old</div>
          <div className="text-lg opacity-90">{age.months} months and {age.days} days</div>
        </div>
      )}
    </div>
  );
}

export default AgeCalculator
