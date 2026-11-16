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
    <> 
    <h3>Products</h3>
    <div>
        {products.map((product) => (
            <ProductCard key={product.id} product={product}/>
        ))}
    </div>
 
    </>
  )
}

export default ProductList;