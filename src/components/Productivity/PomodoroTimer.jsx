import React from 'react'
import {useState} from 'react'


function PomodoroTimer() {
  const [time, setTime] = useState(1500);
  const [active, setActive] = useState(false);
  
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-xl shadow-2xl text-white text-center">
      <div className="text-7xl font-bold mb-8">{Math.floor(time/60)}:{(time%60).toString().padStart(2,'0')}</div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setActive(!active)} className="px-8 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100">
          {active ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => {setTime(1500); setActive(false);}} className="px-8 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100">
          Reset
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer
