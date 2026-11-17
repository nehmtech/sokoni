import React from "react";
import { Link, Routes, Route } from "react-router-dom"
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";


function App() {
  return (
    <>
    <Header />
    <Routes>
      
      {/* Routes starts here */}

      <Route path="/" element={<ProductList />} />
      <Route path="/products/:slug" element={<ProductDetail />} />

      {/* Routes ends here */}      

    </Routes>
    <Footer />
    </>
  )
}



export default App;