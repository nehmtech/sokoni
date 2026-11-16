import React from "react";
import { Link } from "react-router-dom"

function ProductCard({ product }) {
    return (
    <Link to={`products/${product.slug}`}
    className="block rounded-lg shadow p-2"
    
    > 
        <h4>{product.title}</h4> 
        <h4>{product.price}</h4> 
        <h4>{product.stock}</h4> 
       
    </Link>
    );
}

export default ProductCard;