import React from "react";
import { getProduct } from "../api";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"

function ProductDetail() {
 const { slug } = useParams()
  const [product, setProduct] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

useEffect(() => {
    async function loadProduct() {
        try{
            const data = await getProduct()
            setProduct(data);
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    loadProduct()
}, [slug]);


  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  
  return (
    <> 
    <div>
        <h4>{product.title}</h4> 
        <h4>{product.description}</h4> 
        <h4>{product.price}</h4> 
        <h4>{product.stock}</h4> 
    </div>
    <Link to="/">
    Back to products
    </Link> 


    </>
  )
}

export default ProductDetail;