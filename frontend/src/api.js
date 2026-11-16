const BASE_URL = "http://127.0.0.1:8000/api";

// GET /api/products/
export async function getProducts(){
    const response = await fetch(`${BASE_URL}/products/`)
    console.log(response)
    if (!response.ok){
        throw new Error("Could not load products")
    }
    return response.json();
}

// GET /api/products/<slug>/
export async function getProduct(slug){
    const response = await fetch(`${BASE_URL}/products/${slug}/`)
    console.log(response)
    if (!response.ok){
        throw new Error("Product not found")
    }
    return response.json();
}

