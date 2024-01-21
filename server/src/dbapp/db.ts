import sqlite3 from 'sqlite3'
import {validate as uuidValidate, v4 as uuidv4} from 'uuid'
import fs from 'fs'
import crypto from 'crypto'


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
        const stmt = this.db.prepare("INSERT INTO session (token, user, expiry) VALUES (?, ?, ?)")
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

    public listTodos(token: string) {
        const todosPromise = new Promise<Todo[]>((res, rej) => {
            this.checkSession(token).then((session) => {
                const userId = session.user;
                const stmt = this.db.prepare("SELECT list_order, value FROM `todo_item` WHERE user = ?")
                stmt.all(userId, (err, rows: Todo[]) => {
                    res(rows)
                })
            })
        })
        return todosPromise
    }

    public addTodo(token: string, order: number, value: number): Promise<void> {
        const resultPromise = new Promise<void>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("INSERT INTO `todo_item` (user, list_order, value) VALUES (?, ?, ?)")
                stmt.run(userId, order, value, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res()
                }).finalize()
            })
        })
        return resultPromise
    }

    public editTodo(token: string, order: number, value: Todo): Promise<any> {
        const resultPromise = new Promise<any>((res, rej)=>{
            this.checkSession(token).then((session) => {
                const userId = session.user
                const stmt = this.db.prepare("UPDATE todo_item SET list_order = ?, value = ? WHERE (user = ?) AND (list_order = ?)")
                stmt.run(value.order, value.value, userId, order, function(this: any, err) {
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

    public deleteTodo(token: string, order: number): Promise<void> {
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

interface Todo {
    order: number,
    value: string
}

export default DB