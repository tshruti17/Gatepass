
import React, { useState } from 'react';
function App() {
  // const [title,setTitle]=useState("");
  // const [desc,setDesc]=useState("");
  const[alltodo,setalltodo]=useState([]);
  const[singleTodo,setSingleTodo]=useState({title:"",desc:""});
  function handleTitle(e){
    // setTitle(e.target.value);
    setSingleTodo(preValue=>({...preValue,title:e.target.value}));
    
  }
  function handleDesc(e){
    // setDesc(e.target.value);
    setSingleTodo(preValue=>({...preValue,desc:e.target.value}));
  }
  function handleClick(){
    // console.log(title,desc);
    setalltodo(preValue=>[...preValue,singleTodo]);
    //setalltodo([...alltodo,singleTodo]);
  }
  function deleteTodo(i){
    const newTodos = [...alltodo];  // make a copy
    newTodos.splice(i, 1);          // remove the item
    setalltodo(newTodos);
  }
  return (
    <>
    <div>
  <input type="text" placeholder="title" onChange={handleTitle}/>
  <br />
  <br />
  <input type="text" placeholder="desc" onChange={handleDesc} />
  <br />
  <br />
  <button onClick={handleClick}>Add Todo</button>
    </div>
    <div>
      {
        alltodo.map((data,i)=>(
          <div key={i}>
            <p>{i+1}</p>
            <h1>{data.title}</h1>
            <p>{data.desc}</p>
            <button onClick={()=>deleteTodo(i)}>Delete</button>
            </div>
        ))
      }
    </div>
   </>  
  )
}

export default App
