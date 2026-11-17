import React from "react";
import { Link } from "react-router-dom"

function Footer({ product }) {
    return (
        <div className="mt-20 bg-gray-100 text-center p-4">
    <Link to="/" > Sokoni - All rights reserved
    </Link>
    </div>
    );
}

export default Footer;