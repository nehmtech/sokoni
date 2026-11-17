import React from "react";
import { getProducts } from "../api";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

useEffect(() => {
    async function loadProducts() {
        try{
            const data = await getProducts()
            setProducts(data);
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    loadProducts()
}, []);


  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  
  return (
    <div className="ms-10 me-10"> 
    <h3 className="mb-4">Products</h3>
    <div className="flex gap-2 justify-start justify-between   ">
        {products.map((product) => (
            <ProductCard key={product.id} product={product}/>
        ))}
    </div>
 
    </div>
  )
}

export default ProductList;