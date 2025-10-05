import React from 'react'
import {useState} from 'react'



function BMICalculator() {
 const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  
  const calculate = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if(h && w) {
      const bmiValue = (w / (h * h)).toFixed(2);
      setBmi(bmiValue);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-green-500 to-teal-600 p-8 rounded-xl shadow-2xl text-white">
      <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} 
        className="w-full p-3 rounded-lg mb-3 text-gray-800 font-semibold" />
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} 
        className="w-full p-3 rounded-lg mb-4 text-gray-800 font-semibold" />
      <button onClick={calculate} className="w-full p-3 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100">Calculate BMI</button>
      {bmi && (
        <div className="mt-6 text-center">
          <div className="text-5xl font-bold">{bmi}</div>
          <div className="text-xl mt-2">Your BMI</div>
          <div className="text-sm mt-2 opacity-90">
            {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
          </div>
        </div>
      )}
    </div>
  );
}

export default BMICalculator
