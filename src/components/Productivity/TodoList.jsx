import { useState } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if(input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <button onClick={addTodo} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
          Add
        </button>
      </div>
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => setTodos(todos.map(t => t.id === todo.id ? {...t, done: !t.done} : t))}
              className="w-5 h-5 cursor-pointer"
            />
            <span className={`flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {todo.text}
            </span>
            <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;