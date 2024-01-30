import express from 'express'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import DB from './db.js'

const db = new DB()

const router = express.Router()

router.post("/user/create", (req, res) => {
    const userId = uuidv4()
    db.createUser(userId).then((key) => {
        res.send({status: "ok", content: {userId, key}})
    })
})

router.post("/user/:userId", (req, res) => {
    const userId = req.params.userId
    console.log(`getting user ${userId}`)
    db.getUser(userId, (err, rows: any[]) => {
        if (rows.length === 0) {
            res.send({status: "error", content: "no such user"})
            return
        }
        const userRow = rows[0]
        // check key
        const key = req.body.key
        const hashfn = crypto.createHash('sha256');
        hashfn.update(key)
        const hashkey = hashfn.digest().toString("hex")
        if (userRow.key !== hashkey) {
            res.send({status: "error", content: "Authentication failed. Key invalid"})
            return
        }

        // return session
        db.createSession(userId).then((token)=>{
            res.send({status: "ok", content: {token, description:"authentication success"}})
        })
    })
})

router.post("/list", (req, res) => {
    db.listTodos(req.body.token).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.post("/list/add", (req, res) => {
    db.addTodo(req.body.token, req.body.todo.list_order, req.body.todo.value).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.post("/list/:order/edit", (req, res) => {
    const order = parseInt(req.params.order)
    console.log(req.body)
    console.log(req.params)
    db.editTodo(req.body.token, order, req.body.todo).then((item)=>{
        res.send({status:"ok", content: {description: "success", item}})
    })
})

router.delete("/list/:order", (req, res) => {
    const order = parseInt(req.params.order)
    db.deleteTodo(req.body.token, order).then(()=>{
        res.send({status:"ok", content: "success"})
    })
})

export default router
