import React, { useEffect, useState } from "react"
import API from "../api"
import { Todo } from "../interfaces"

export const TodoMain = function (props: {api: API}) {
    const [todos, setTodos] = useState<Todo[]>([])
    const [editing, setEditing] = useState<number | null>(null)

    const addOrderRef = React.createRef<HTMLInputElement>()
    const addValRef = React.createRef<HTMLInputElement>()

    const editTodoOrder = React.createRef<HTMLInputElement>()
    const editTodoVal = React.createRef<HTMLInputElement>()

    function addTodo(e: any) {
        const value = addValRef.current?.value || "";
        const list_order = parseInt(addOrderRef.current?.value || "0");
        props.api.addTodo(list_order, value)

        const newTodo: Todo = {list_order, value, checked: false}
        const newTodos = [...todos, newTodo]
        newTodos.sort((a:Todo, b:Todo) => a.list_order - b.list_order)

        addOrderRef.current!.value = ""
        addValRef.current!.value = ""
        setTodos(newTodos)
    }

    function deleteTodo(list_order: number) {
        props.api.deleteTodo(list_order)
        const newTodos = todos.filter(todo => todo.list_order !== list_order)
        setTodos(newTodos)
    }

    function editTodo(list_order: number) {
        const value = editTodoVal.current?.value || "";
        const new_order = parseInt(editTodoOrder.current?.value || "0");
        const newTodo: Todo = {list_order: new_order, value, checked: false}
        props.api.editTodo(list_order, newTodo)
        
        const newTodos = todos.map(todo => {
            if (todo.list_order === list_order) {
                todo.value = value
                todo.list_order = new_order
            }
            return todo
        })
        newTodos.sort((a:Todo, b:Todo) => a.list_order - b.list_order)
        setTodos(newTodos)
    }

    function toggleTodo(todo: Todo) {
        const newTodo: Todo = {list_order: todo.list_order, value: todo.value, checked: !todo.checked}
        props.api.editTodo(todo.list_order, newTodo)

        const newTodos = todos.map(t => {
            if (t.list_order === todo.list_order) {
                t.checked = !t.checked
            }
            return t
        })

        setTodos(newTodos)
    }

    useEffect(() => {
        props.api.listTodos().then((todos: Todo[]) => {
            // sort todos by list_order
            todos.sort((a:Todo, b:Todo) => a.list_order - b.list_order)
            setTodos(todos)
        })
    }, [props.api])
    
    useEffect(() => {
        setEditing(null)
    }, [todos])

    return (<div className="todo_items">
        {todos.map(todo => {
            return (<div className="todo_item" key={todo.list_order}>
                {(editing === todo.list_order) ? <>
                    <input ref={editTodoOrder} className="todo_item_order" defaultValue={todo.list_order} />
                    <input ref={editTodoVal} className="todo_item_value" defaultValue={todo.value} />
                    <button onClick={(e)=>editTodo(todo.list_order)} className="todo_item_edit">Submit</button>
                </> : <>
                    <button onClick={(e)=>toggleTodo(todo)} className={"todo_item_checked " + (todo.checked ? "todo_item_done" : "todo_item_not_done")} />
                    <div className={"todo_item_order" + (todo.checked ? " todo_item_finished" : "")}>{todo.list_order}</div>
                    <div className={"todo_item_value" + (todo.checked ? " todo_item_finished" : "")}>{todo.value}</div>
                    <button onClick={(e) => deleteTodo(todo.list_order)} className="todo_item_delete">X</button>
                    <button onClick={(e) => setEditing(todo.list_order)} className="todo_item_edit">Edit</button>
                </>}
            </div>)
        })}
        <div className="add_todo">
            <input ref={addOrderRef} required type="number" className="add_item_order" placeholder="Order"></input>
            <input ref={addValRef} required type="text" className="add_item_value" placeholder="Add a todo"></input>
            <button onClick={addTodo}>Add</button>
        </div>
    </div>)
}