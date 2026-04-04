import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <h3>TensorCourt</h3>
        <p>Transforming judicial systems with AI.</p>
      </div>

      <div>
        <h4>Product</h4>
        <p>Features</p>
        <p>Pricing</p>
      </div>

      <div>
        <h4>Company</h4>
        <p>About</p>
        <p>Blog</p>
      </div>

      <div>
        <h4>Legal</h4>
        <p>Privacy</p>
        <p>Terms</p>
      </div>
    </footer>
  );
};

export default Footer;