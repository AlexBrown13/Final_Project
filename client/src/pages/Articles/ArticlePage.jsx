import React from 'react'
import Navbar from "../../components/Navbar";
import { getApiBase } from "../../config/api.js";

export default function ArticlePage() {
    const runTriger = async () => {
        const userId = localStorage.getItem("trauma_user_id");

        if(!userId) {
            console.log("Iser ID not found");
        }

        const base = getApiBase();
        const res = await fetch(`${base}/api/articles`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("trauma_auth_token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log(data);
    };

  return (
    <div>
      <Navbar />
      <button onClick={runTriger}>triger with userId</button>
    </div>
  )
}
