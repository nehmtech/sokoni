import React from "react";
import { Link } from "react-router-dom"

function ProductCard({ product }) {
    return (
    <Link to={`products/${product.slug}`}
    className="block rounded-lg shadow hover:shadow-md overflow-hidden "
    
    > {product.image ? (
        <img 
        src={product.image}
        alt={product.title}
        className="w-full h-30 object-cover"
        />
    ) : (
        <div className="w-full h-30 bg-gray-200 flex items-center justify-center text-gray-500">
            No image
        </div>
    )}
    <div className="p-3">
        <h4>{product.title}</h4> 
        <p>Ksh. {product.price}</p> 
        <p>Stock: {product.stock}</p> 
    </div>
    </Link>
    );
}

export default ProductCard;