export interface Todo {
    checked: any;
    value: string;
    list_order: number;
}

export interface TodoList {
    id: string;
    todos: Todo[];
}
