import React from "react";
import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:9000/api/products/"

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      setProducts(data);
      setLoading(false)
    })
    .catch((err) => {
      console.error("Error fetching products:", err)
      setLoading(false)
    });

  }, [])

  if (loading) return <p>Loading...</p>

  
  return (
    <> 
    <div>
      <h1>Products</h1>
      <div className="flex ms-4 me-4">
        {products.map((product) => (
          
          <div key={product.id}
          className="border rounded p-2 m-2"
          
          > 
          <img src={product.image} alt={product.name} className="w-100" />
          <h3>{product.title}</h3>
          <h3>{product.description}</h3>
          <h3>{product.price}</h3>
          <h3>{product.stock}</h3>
          </div>
        ))}
      </div>
    </div>
 
    </>
  )
}

export default App;