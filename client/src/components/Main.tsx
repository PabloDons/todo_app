import React from "react";
import API from "../api";
import { Menu } from "./Menu";
import { TodoMain } from "./TodoMain";


export const Main = function (props: {api: API}) {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        props.api.listProjects().then(projects => {
            setProjects(projects);
        });
    }, []);

    return <div className="menu">{projects.map(project => <div>
        <a href={`/project/${project.id}`}>{project.name}</a>
        <TodoMain api={props.api} />
    </div>)}</div>
}