import React, { useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid'
import './App.css';
import API from './api';

function App() {
  const [todos, setTodos] = useState<any[]>([]);
  const [inputOrderVal, setInputOrderVal] = useState('');
  const [inputTodoVal, setInputTodoVal] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Call your function here
    addTodo(
      inputOrderVal,
      inputTodoVal
    );

    setInputOrderVal('');
    setInputTodoVal('');
  }
  
  useEffect(()=>{    
    listTodos().then((val: any[]) => {
      setTodos(val)
    })
  }, [])

  return (
    <div className="App">
      <p>Todos:</p>
      {todos.map(todo =>
        <p key={uuidv4()}>
          <span>{(todo.list_order).toString()}: {todo.value}</span>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input className="todo_order"
          type="number" 
          value={inputOrderVal} 
          onChange={e => setInputOrderVal(e.target.value)} 
        />
        <input className="todo_value"
          type="text" 
          value={inputTodoVal} 
          onChange={e => setInputOrderVal(e.target.value)} 
        />
        <button type="submit" className="todo_submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
