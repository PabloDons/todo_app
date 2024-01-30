import { Todo } from "./interfaces";

const HOST_ADDRESS = process.env.APP_HOST_ADDRESS || "http://localhost:8052"

class API {
    public token: string;

    constructor() {
        this.token = '';
    }

    public static async createAPI() {
        const API = new this();
        API.token = await API.getSession();
        return API;
    }

    public async createUser() {
        let res = await fetch(HOST_ADDRESS+"/db/user/create", { method: "POST" })
        let jsonRes = await res.json()
        localStorage.setItem("userId", jsonRes.content.userId)
        localStorage.setItem("key", jsonRes.content.key)
        return {
            userId: jsonRes.content.userId,
            key: jsonRes.content.key,
        }
    }

    public async getSession() {
        if (localStorage.getItem("token") !== null) {
            return localStorage.getItem("token")
        }

        let userId = localStorage.getItem("userId")
        let key = localStorage.getItem("key")
        if (userId === null) {
            const userObj = await this.createUser()
            userId = userObj.userId
            key = userObj.key
        }
        let res = await fetch(HOST_ADDRESS+"/db/user/" + userId, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
        let jsonRes = await res.json()
        localStorage.setItem("token", jsonRes.content.token)
        return jsonRes.content.token
    }

    public async listTodos() {
        let token = this.token
        if (token === null) {
            token = await this.getSession()
        }
        let res = await fetch(HOST_ADDRESS+"/db/list", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token }) })
        let jsonRes = await res.json()
        return jsonRes.content.list;
    }

    public async addTodo(list_order: number, value: string): Promise<Todo[]> {
        let token = this.token
        if (token === null) {
            token = await this.getSession()
        }

        const body = {
            token,
            todo: {
                list_order: list_order,
                value: value,
            },
        }
        let res = await fetch(HOST_ADDRESS+"/db/list/add", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        let jsonRes = await res.json()
        return jsonRes.content.list;
    }

    public async deleteTodo(list_order: number) {
        let token = this.token
        if (token === null) {
            token = await this.getSession()
        }
        const body = {
            token,
        }
        let res = await fetch(HOST_ADDRESS+"/db/list/"+list_order, { method: "DELETE", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        let jsonRes = await res.json()
        return jsonRes.content.todos;
    }

    public async editTodo(list_order: number, new_value: Todo) {
        let token = this.token
        if (token === null) {
            token = await this.getSession()
        }
        const body = {
            token,
            todo: {
                value: new_value.value,
                list_order: new_value.list_order,
                checked: new_value.checked,
            },
        }
        let res = await fetch(HOST_ADDRESS+`/db/list/${list_order}/edit`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        let jsonRes = await res.json()
        return jsonRes.content.todos;
    }
        
}

export default API;



