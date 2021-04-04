import React, { useState, useEffect } from 'react';
import 'clearblade-js-client/lib/mqttws31'; 
import { ClearBlade } from 'clearblade-js-client';
import Button from 'react-bootstrap/Button';

import './ToDo.css';

let cb = null;


export function ToDo() {
    
    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading || cb == null) {
        cb = new ClearBlade();
        cb.init({
           URI: 'https://platform.clearblade.com', 
           systemKey: process.env.REACT_APP_SYSTEM_KEY,
           systemSecret: process.env.REACT_APP_SYSTEM_SECRET,
           callback: initCallback,
       });
    }
    
    async function initCallback(err, authInfo) { 
        if (err) {
            throw new Error(cb);
        } else {
            console.log("Successfully init ClearBlade!");
            fetchData();
            setIsLoading(false);
        }
    }

    async function fetchData() {
        if (cb == null) {
            return;
        }
        var collection = cb.Collection({collectionName: "Collection1"});
        collection.fetch(function collectionFetchCallback(err, rows) {
            if (err) {
                console.log("Error: Couldn't retrieve data.");
            } else {
                setTasks(rows);
            }     
        });
    }
 
    function handleCheckboxChange(event) {
        var query = cb.Query({collectionName: "Collection1"});
        query.equalTo('item_id', event.target.id);
        var changes = {
            completed: event.target.checked
        }
        var callback = function (err, data) {
            if (err) {
                console.log("Error: Could not update");
            } else {
                fetchData();
            }
        }
        var collection = cb.Collection({collectionName: "Collection1"});
        collection.update(query, changes, callback);
    }

    

    
    return (
        <div className="TaskList">
            <div className="ButtonBar">
                <h3>Task List</h3>
                <div className="RefreshButton">
                    <Button variant="primary" onClick={fetchData}>Refresh</Button>
                </div>
            </div>

            <hr></hr>
           
            {isLoading && <h2>Loading Tasks...</h2>}
            <form>
                {tasks.sort((task1, task2) =>
                    (task1.data.task_name > task2.data.task_name) ? 1 : -1)
                    .map(task => {
                        return <div className="Task">
                            <input type="checkbox"
                                key={task.data.item_id}
                                id={task.data.item_id}
                                name={task.data.task_name}
                                onChange={handleCheckboxChange}
                                defaultChecked={task.data.completed} />
                            <label for={task.data.task_name}
                                className={"TaskName-" + (task.data.completed ? "Done" : "ToDo")}>
                                {task.data.task_name}
                            </label>
                        </div>
                })}
            </form>
        </div>
    );
}

export default ToDo;