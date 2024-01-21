import React, { useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid'
import './App.css';

async function createUser() {
  let res = await fetch("http://localhost:8052/db/user/create", {method: "POST"})
  let jsonRes = await res.json()
  localStorage.setItem("userId", jsonRes.content.userId)
  localStorage.setItem("key", jsonRes.content.key)
  return {
    userId: jsonRes.content.userId,
    key: jsonRes.content.key,
  }
}

async function getSession() {
  let userId = localStorage.getItem("userId")
  let key = localStorage.getItem("key")
  if (userId === null) {
    const userObj = await createUser()
    userId = userObj.userId
    key = userObj.key
  }
  let res = await fetch("http://localhost:8052/db/user/"+userId, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({key})})
  let jsonRes = await res.json()
  localStorage.setItem("token", jsonRes.content.token)
  return jsonRes.content.token
}

async function listTodos() {
  let token = localStorage.getItem("token")
  if (token === null) {
    token = await getSession()
  }
  let res = await fetch("http://localhost:8052/db/todo", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token:token})})
  let jsonRes = await res.json()
  return jsonRes.content.todos;
}

function App() {
  const [value, setValue] = useState(0);
  const [todos, setTodos] = useState<any[]>([]);

  
  useEffect(()=>{    
    listTodos().then((val: any[]) => {
      setTodos(val)
    })
  }, [value])

  return (
    <div className="App">
      <p>Todos:</p>
      {todos.map(todo =>
        <p key={uuidv4()}>
          <span>{(todo.list_order).toString()}: {todo.value}</span>
        </p>
      )}
    </div>
  );
}

export default App;
