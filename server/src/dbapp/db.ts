import sqlite3 from 'sqlite3'
import {validate as uuidValidate, v4 as uuidv4} from 'uuid'
import fs from 'fs'
import crypto from 'crypto'

const joinUserProject_project = `
    INNER JOIN user_project ON project.id = user_project.project_id
    WHERE user_project.user_id = ?
`
const joinUserProject_todoList = `
    INNER JOIN user_project ON project.id = todo_list.project
    WHERE user_project.user_id = ?
`
const joinUserProject_todoItem = `
    INNER JOIN user_project ON todo_list.project = user_project.project_id
    INNER JOIN another_table ON user_project.some_field = another_table.some_field
    WHERE user_project.user_id = ?
`
class DB {
    db: sqlite3.Database
    constructor() {
        const dbsetup = fs.readFileSync('./src/dbsetup.sql').toString();
        const db = new (sqlite3.verbose()).Database('main.db');
        this.db = db
        db.exec(dbsetup, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    public getUser(userId: string, callback: any) {
        const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?")
        stmt.all(userId, callback).finalize()
    }

    public createUser(userId?: string): Promise<string> {
        
        if (!userId) {
            userId = uuidv4();
        }
        if (!uuidValidate(userId)) {
            throw new Error(`userId ${userId} invalid`)
        }
        
        const stmt = this.db.prepare("INSERT INTO users (id, key) VALUES (?, ?)")
        const keypromise = new Promise<string>((res, rej) => {
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    rej(err)
                    throw err;
                }
                const hashfn = crypto.createHash('sha256');
                const token = buffer.toString("hex")
                hashfn.update(token)
                const hashkey = hashfn.digest().toString("hex")
                stmt.run(userId, hashkey).finalize()
                res(token)
            })
        })
        
        return keypromise
    }

    public createSession(userId: string): Promise<string> {
        const stmt = this.db.prepare("INSERT INTO session (token, user, expiry) VALUES (?, ?, ?) ")
        const tokenpromise = new Promise<string>((res, rej)=>{
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    rej(err)
                    throw err
                }
                const token = buffer.toString("hex")
                const hashfn = crypto.createHash('sha256');
                hashfn.update(token);
                const hashtoken = hashfn.digest().toString("hex")
                stmt.run(hashtoken, userId, Date.now()+86400.0).finalize()
                res(token)
            })
        })
        return tokenpromise
    }

    public createProject(token: string, name: string): Promise<string> {
        const resultPromise = new Promise<string>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const project_id = uuidv4();
                const stmt = this.db.prepare("INSERT INTO project (id, name) VALUES (?, ?); INSERT INTO user_project (user_id, project_id) VALUES (?, ?)")
                stmt.run(project_id, name, userId, project_id, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(project_id)
                })
            })
        })
        return resultPromise
    }

    public listProjects(token: string): Promise<any[]> {
        const resultPromise = new Promise<any[]>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("SELECT project.id, project.name FROM project "+joinUserProject_project)
                stmt.all(userId, userId, (err, rows: any[]) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(rows)
                })
            })
        })
        return resultPromise
    }

    public editProject(token: string, projectId: string, name: string): Promise<string> {
        const resultPromise = new Promise<string>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("UPDATE project SET name = ? WHERE (user = ?) AND (id = ?)")
                stmt.run(name, userId, projectId, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(projectId)
                })
            })
        })
        return resultPromise
    }

    public deleteProject(token: string, projectId: string): Promise<void> {
        const resultPromise = new Promise<void>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("DELETE FROM project WHERE (id = ?) "+joinUserProject_project)
                stmt.run(projectId, userId, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res()
                })
            })
        })
        return resultPromise
    }

    public createTodoList(token: string, projectId: string, name: string): Promise<string> {
        const resultPromise = new Promise<string>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const todo_list_id = uuidv4();
                const checkStmt = this.db.prepare("SELECT 1 FROM project WHERE (project.id = ?) "+joinUserProject_project)
                checkStmt.get(projectId, userId, (err, row) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    if (!row) {
                        rej(new Error("User does not have access to this project."));
                        return;
                    }
                    const stmt = this.db.prepare("INSERT INTO todo_list (id, project, name) VALUES (?, ?, ?)")
                    stmt.run(todo_list_id, projectId, name, (err) => {
                        if (err) {
                            rej(err);
                            return;
                        }
                        res(todo_list_id)
                    })
                })
            })
        })
        return resultPromise
    }

    public listTodoLists(token: string, projectId: string): Promise<any[]> {
        const resultPromise = new Promise<any[]>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("SELECT todo_list.id, todo_list.name FROM todo_list WHERE project = ? "+joinUserProject_todoList)
                stmt.all(projectId, userId, (err, rows: any[]) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(rows)
                })
            })
        })
        return resultPromise
    }

    public editTodoList(token: string, todoListId: string, name: string): Promise<string> {
        const resultPromise = new Promise<string>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("UPDATE todo_list SET name = ? WHERE (todo_list.id = ?) "+joinUserProject_todoList)
                stmt.run(name, todoListId, userId, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(todoListId)
                })
            })
        })
        return resultPromise
    }

    public deleteTodoList(token: string, todoListId: string): Promise<void> {
        const resultPromise = new Promise<void>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("DELETE FROM todo_list WHERE (todo_list.id = ?) "+joinUserProject_todoList)
                stmt.run(todoListId, userId, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res()
                })
            })
        })
        return resultPromise
    }

    public listTodos(token: string, todoListId: string): Promise<TodoItem[]> {
        const todosPromise = new Promise<TodoItem[]>((res, rej) => {
            this.checkSession(token).then((session) => {
                const userId = session.user;
                const stmt = this.db.prepare("SELECT todo_item.list_order, todo_item.value FROM `todo_item` WHERE todo_item.todo_list = ? "+joinUserProject_todoItem+" ORDER BY list_order ASC")
                stmt.all(todoListId, userId, (err, rows: TodoItem[]) => {
                    res(rows)
                })
            })
        })
        return todosPromise
    }

    public addTodo(token: string, todoListId: string, order: number, value: number): Promise<void> {
        const resultPromise = new Promise<void>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                // TODO: check if user has access to todoListId
                const checkStmt = this.db.prepare("SELECT 1 FROM todo_list WHERE (todo_list.project = ?) "+joinUserProject_todoList)
                checkStmt.get(todoListId, userId, (err, row) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    if (!row) {
                        rej(new Error("User does not have access to this todo list."));
                        return;
                    }
                    const stmt = this.db.prepare("INSERT INTO `todo_item` (todo_list, list_order, value) VALUES (?, ?, ?)")
                    stmt.run(todoListId, order, value, (err) => {
                        if (err) {
                            rej(err);
                            return;
                        }
                        res()
                    })
                })
            })
        })
        return resultPromise
    }

    public editTodo(token: string, todoListId: string, order: number, value: string): Promise<any> {
        const resultPromise = new Promise<any>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("UPDATE todo_item SET list_order = ?, value = ? WHERE (list_order = ?) "+joinUserProject_todoItem)
                stmt.run(order, value, order, userId, function(this: any, err) {
                    if (err || this.changes === 0) {
                        rej(err);
                        throw err;
                    }
                    res({changes: this.changes})
                }).finalize()
            })
        })
        return resultPromise
    }

    public deleteTodo(token: string, todoListId: string, order: number): Promise<void> {
        const resultPromise = new Promise<void>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                
                const stmt = this.db.prepare("DELETE FROM todo_item WHERE (user = ?) AND (list_order = ?)")
                stmt.run(userId, order, (err) => {
                    if (err) {
                        rej(err);
                        throw err;
                    }
                    res()
                }).finalize()
            })
        })
        return resultPromise
    }


    private checkSession(token: string): Promise<Session> {
        const stmt = this.db.prepare("SELECT * FROM session WHERE token = ?")
        const userpromise = new Promise<Session>((res, rej) => {
            const hashfn = crypto.createHash('sha256');
            hashfn.update(token);
            const hashtoken = hashfn.digest().toString("hex")
            stmt.all(hashtoken, (err, rows: any[]) =>{
                if (err) {
                    rej(err)
                    throw err
                }
                if (rows.length === 0) {
                    res({expiry: 0, user: ""})
                    return
                }
                res({expiry: rows[0].expiry, user: rows[0].user})
            }).finalize()
        })
        return userpromise
    }
}

interface User {
    userId: string,
    key: string
}

interface Session {
    expiry: number,
    user: string
}

interface TodoItem {
    list_order: number,
    value: string
}

interface TodoList {
    id: string,
    name: string
}

interface Project {
    id: string,
    name: string
}

interface UserProject {
    user: string,
    project: string
}

export default DB