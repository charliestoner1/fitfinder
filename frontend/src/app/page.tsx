"use client";
import {use, useEffect, useState} from "react";

export default function Home(){
  const [itemList, setItemList] = useState<any[]>([]);
  useEffect(()=>{
    const getItems = async () =>{
      const items = await fetch("http://127.0.0.1:8000/api/wardrobe/items/");
      const response = await items.json();
      console.log('Backend response', response);
      setItemList(response);
    }
    getItems();
  },[]);

  return(
    <>
      <h1>List of Items:</h1>
      <br></br>
      <ul>
        {itemList.map((item) => (
          <li key = {item.id}>{item.name}</li>
        ))}
      </ul>
      
    </>
  )
}