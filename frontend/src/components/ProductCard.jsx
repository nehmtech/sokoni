import React from "react";

function ProductCard({name="HP Laptop", price = 20000,stock = 50}) {
    return (
    <> 
        <h2>Product page</h2>
        <h4>Product name: {name}</h4> 
        <h4>Product price: {price}</h4> 
        <h4>Product stock: {stock}</h4> 
       
    </>
    );
}

export default ProductCard;