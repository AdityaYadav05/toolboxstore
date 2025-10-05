import React from 'react'
import {useState} from 'react'

function Calculator() {
   const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);

  const handleNum = (num) => setDisplay(display === '0' ? num : display + num);
  const handleOp = (operator) => { setPrev(parseFloat(display)); setOp(operator); setDisplay('0'); };
  const calculate = () => {
    const curr = parseFloat(display);
    let result;
    switch(op) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/': result = prev / curr; break;
      default: return;
    }
    setDisplay(result.toString());
    setPrev(null);
    setOp(null);
  };
  const clear = () => { setDisplay('0'); setPrev(null); setOp(null); };

  return (
    <div className="max-w-sm mx-auto bg-gray-800 p-6 rounded-xl shadow-2xl">
      <div className="bg-gray-900 p-4 rounded-lg mb-4 text-right text-white text-3xl font-mono">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
          <button key={btn} onClick={() => { if(btn === '=') calculate(); else if(['+','-','*','/'].includes(btn)) handleOp(btn); else handleNum(btn); }}
            className={`p-4 rounded-lg font-bold text-lg ${btn === '=' ? 'bg-green-600 hover:bg-green-700' : ['+','-','*','/'].includes(btn) ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition`}>
            {btn}
          </button>
        ))}
      </div>
      <button onClick={clear} className="w-full mt-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">Clear</button>
    </div>
  );
};


export default Calculator
