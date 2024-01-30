import React, { useEffect } from "react";
import API from "../api";
import { TodoMain } from "./TodoMain";


export const Main = function (props: {api: API}) {
    return (
        <div className="app">
            <h1>Todo List</h1>
            <TodoMain api={props.api}></TodoMain>
        </div>
    );
}