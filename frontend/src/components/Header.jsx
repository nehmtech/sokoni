import React from "react";
import { Link } from "react-router-dom"

function Header({ product }) {
    return (
    <div className="mb-4 bg-gray-100 p-4">
        <span><Link to="/" className="me-2"> Home    </Link></span>
        <span><Link to="/" className="me-2"> Products    </Link></span>
        <span><Link to="/" className="me-2"> New Arrivals  </Link></span>
        <span><Link to="/"> Cart </Link></span>
    </div>
    );
}

export default Header;