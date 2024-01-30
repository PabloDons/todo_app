export interface Todo {
    id: string;
    value: string;
    list_order: number;
}

export interface TodoList {
    id: string;
    todos: Todo[];
}
