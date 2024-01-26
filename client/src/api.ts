class API {
    public token: string;

    constructor() {
        this.token = '';
    }

    public static async createAPI(token: string, projectName: string) {
        const API = new this();
        API.token = await API.getSession();
        return API;
    }

    public async createUser() {
        let res = await fetch("http://localhost:8052/db/user/create", { method: "POST" })
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
        let res = await fetch("http://localhost:8052/db/user/" + userId, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
        let jsonRes = await res.json()
        localStorage.setItem("token", jsonRes.content.token)
        return jsonRes.content.token
    }

    public async listTodos() {
        let token = localStorage.getItem("token")
        if (token === null) {
            token = await this.getSession()
        }
        let res = await fetch("http://localhost:8052/db/todo", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token }) })
        let jsonRes = await res.json()
        return jsonRes.content.todos;
    }

    public async addTodo(list_order: string, value: string) {
        const list_order_int = parseInt(list_order)
        let token = localStorage.getItem("token")
        if (token === null) {
            token = await this.getSession()
        }

        const body = {
            token,
            order: list_order_int,
        }
        let res = await fetch("http://localhost:8052/db/todo/add", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token }) })
        let jsonRes = await res.json()
        return jsonRes.content.todos;
    }
    // Function to create a project
    public async createProject(token: string, projectName: string) {
        return await fetch('/project/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, project: { name: projectName } }),
        }).then(response => response.json());
    }


    // Function to edit a project
    public async editProject(token: string, projectId: string, projectName: string) {
        return await fetch(`/project/${projectId}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, project: { name: projectName } }),
        }).then(response => response.json());
    }
}

export default API;




