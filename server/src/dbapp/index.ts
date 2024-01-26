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

router.post("/project/create", (req, res) => {
    db.createProject(req.body.token, req.body.project.name).then((project)=>{
        res.send({status: "ok", content: {project}})
    })
})

router.post("/project/:projectId/edit", (req, res) => {
    db.editProject(req.body.token, req.params.projectId, req.body.project.name).then((project)=>{
        res.send({status: "ok", content: {project}})
    })
})

router.post("/project/:projectId", (req, res) => {
    db.listTodoLists(req.body.token, req.params.projectId).then((project)=>{
        res.send({status: "ok", content: {project}})
    })
})

router.delete("/project/:projectId", (req, res) => {
    db.deleteProject(req.body.token, req.params.projectId).then(()=> {
        res.send({status: "ok", content: "success"})
    })
})

router.post("/list/create", (req, res) => {
    db.createTodoList(req.body.token, req.body.list.project, req.body.list.name).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.post("/list/:listId/edit", (req, res) => {
    db.editTodoList(req.body.token, req.params.listId, req.body.list.name).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.post("/list/:listId", (req, res) => {
    db.listTodos(req.body.token, req.params.listId).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.delete("/list/:listId", (req, res) => {
    db.deleteTodoList(req.body.token, req.params.listId).then(()=> {
        res.send({status: "ok", content: "success"})
    })
})

router.post("/list/:listId/add", (req, res) => {
    db.addTodo(req.body.token, req.params.listId, req.body.todo.order, req.body.todo.value).then((list)=>{
        res.send({status: "ok", content: {list}})
    })
})

router.post("/list/:listId/:order/edit", (req, res) => {
    const order = parseInt(req.params.order)
    db.editTodo(req.body.token, req.params.listId, order, req.body.todo.new).then((item)=>{
        res.send({status:"ok", content: {description: "success", item}})
    })
})

router.delete("/list/:listId/:order", (req, res) => {
    const order = parseInt(req.params.order)
    db.deleteTodo(req.body.token, req.params.listId, order).then(()=>{
        res.send({status:"ok", content: "success"})
    })
})

export default router
