// src/components/whatever-path/Search.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const Search = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchBy, setSearchBy] = useState("name"); // name | description | price
  const [error, setError] = useState("");

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.listProducts();
      const arr = Array.isArray(data) ? data : data?.items || [];
      setProducts(arr);
      setSearchResults(arr);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(products);
      return;
    }
    const term = searchTerm.toLowerCase();

    const filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const price = (p.price ?? "").toString();

      if (searchBy === "name") return name.includes(term);
      if (searchBy === "description") return desc.includes(term);
      if (searchBy === "price") return price.includes(term);
      return name.includes(term);
    });

    setSearchResults(filtered);
    setSelectedProduct(null);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults(products);
    setSelectedProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, searchBy, products]);

  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>Cake &amp; Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin/product/dashboard">Dashboard</Link>

          <Link to="/cadmin/product/form">Products</Link>
          <Link to="/cadmin/product/reports">Reports</Link>
          <Link to="/cadmin/product/search" className="active">
            Search Engine
          </Link>
        </nav>
      </div>

      {/* Main */}
      <div className="main">
        <h1>Product Search Engine</h1>

        {/* Search Controls */}
        <div className="search-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder={`Search by ${searchBy}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={clearSearch} className="btn-clear">
              Clear
            </button>
          </div>

          <div className="search-filters">
            <label>Search by:</label>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Product Name</option>
              <option value="description">Description</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p>Found {searchResults.length} product(s)</p>
          {error && <p style={{ color: "#b00020" }}>Error: {error}</p>}
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="search-results-container">
            {/* List */}
            <div className="results-list">
              <h3>Search Results</h3>
              {searchResults.length === 0 ? (
                <div className="no-results">
                  <p>No products found matching your search.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {searchResults.map((p) => (
                    <div
                      key={p._id || p.id || p.name}
                      className={`product-card ${
                        selectedProduct &&
                        (selectedProduct._id || selectedProduct.id) ===
                          (p._id || p.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div className="product-image">
                        {p.image || p.imageUrl ? (
                          <img src={p.image || p.imageUrl} alt={p.name} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{p.name}</h4>
                        <p className="price">
                          Rs. {Number(p.price || 0).toLocaleString()}
                        </p>
                        <p className="quantity">
                          Qty: {p.quantity ?? p.stock ?? 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="product-details">
              {selectedProduct ? (
                <>
                  <h3>Product Details</h3>
                  <div className="details-card">
                    <div className="detail-image">
                      {selectedProduct.image || selectedProduct.imageUrl ? (
                        <img
                          src={
                            selectedProduct.image || selectedProduct.imageUrl
                          }
                          alt={selectedProduct.name}
                        />
                      ) : (
                        <div className="no-image-large">No Image Available</div>
                      )}
                    </div>

                    <div className="detail-info">
                      <div className="detail-row">
                        <label>Product ID:</label>
                        <span>{selectedProduct._id || selectedProduct.id}</span>
                      </div>
                      <div className="detail-row">
                        <label>Name:</label>
                        <span>{selectedProduct.name}</span>
                      </div>
                      <div className="detail-row">
                        <label>Description:</label>
                        <span>{selectedProduct.description}</span>
                      </div>
                      <div className="detail-row">
                        <label>Price:</label>
                        <span>
                          Rs.{" "}
                          {Number(selectedProduct.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <label>Quantity:</label>
                        <span>
                          {selectedProduct.quantity ??
                            selectedProduct.stock ??
                            0}
                        </span>
                      </div>
                      <div className="detail-row">
                        <label>Status:</label>
                        <span
                          className={`status ${
                            (selectedProduct.quantity ??
                              selectedProduct.stock ??
                              0) > 0
                              ? "in-stock"
                              : "out-of-stock"
                          }`}
                        >
                          {(selectedProduct.quantity ??
                            selectedProduct.stock ??
                            0) > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <Link to="/dash" className="btn-view-all">
                        View All Products
                      </Link>
                      <Link to="/form" className="btn-add-new">
                        Add New Product
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <p>Select a product to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        body { margin:0; font-family:"Arial", sans-serif; background:#fdfdfd; color:#333; display:flex; }
        .linklike { background:none; border:none; padding:12px 10px; margin:5px 0; color:#0a58ca; text-align:left; cursor:pointer; display:block; border-radius:6px; }
        .linklike:hover { background:#e8f0ff; }

        .sidebar { width:250px; background:#ffe9dc; min-height:100vh; padding:20px; box-sizing:border-box; position:fixed; top:0; left:0; }
        .sidebar .logo { text-align:center; margin-bottom:30px; }
        .sidebar .logo h2 { font-family:"Brush Script MT", cursive; color:#e74c3c; }
        .sidebar nav a { display:block; text-decoration:none; padding:12px 10px; color:#333; margin:5px 0; border-radius:6px; transition:.3s; font-weight:500; }
        .sidebar nav a:hover, .sidebar nav a.active { background:#ff6f61; color:white; }

        .main { margin-left:250px; padding:30px; width:100%; min-height:100vh; background:#f8f9fa; }
        .main h1 { font-size:28px; margin-bottom:20px; color:#e74c3c; }

        .search-controls { background:white; padding:20px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,.1); margin-bottom:20px; display:flex; gap:20px; align-items:end; }
        .search-bar { flex:1; }
        .search-input { width:100%; padding:10px; border:2px solid #ddd; border-radius:6px; font-size:16px; margin-bottom:10px; }
        .btn-clear { background:#95a5a6; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-size:14px; }
        .btn-clear:hover { background:#7f8c8d; }

        .search-filters { display:flex; flex-direction:column; gap:5px; }
        .filter-select { padding:10px; border:2px solid #ddd; border-radius:6px; font-size:14px; }

        .results-summary { margin-bottom:20px; }
        .results-summary p { font-weight:bold; color:#666; }

        .search-results-container { display:grid; grid-template-columns:1fr 1fr; gap:30px; height:calc(100vh - 250px); }
        .results-list { background:white; padding:20px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,.1); overflow-y:auto; }
        .results-list h3 { margin-top:0; color:#e74c3c; border-bottom:2px solid #ffe9dc; padding-bottom:10px; }

        .products-grid { display:grid; gap:15px; margin-top:15px; }
        .product-card { border:2px solid #eee; border-radius:8px; padding:15px; cursor:pointer; transition:all .3s; display:flex; gap:15px; align-items:center; }
        .product-card:hover { border-color:#3498db; transform:translateY(-2px); }
        .product-card.selected { border-color:#e74c3c; background:#fff5f5; }
        .product-image { width:60px; height:60px; border-radius:6px; overflow:hidden; }
        .product-image img { width:100%; height:100%; object-fit:cover; }
        .no-image { width:100%; height:100%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; font-size:12px; }
        .product-info h4 { margin:0 0 5px; color:#333; }
        .price { font-weight:bold; color:#27ae60; margin:0; }
        .quantity { color:#666; margin:0; font-size:14px; }

        .product-details { background:white; padding:20px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,.1); overflow-y:auto; }
        .details-card { text-align:center; }
        .detail-image { width:200px; height:200px; margin:0 auto 20px; border-radius:10px; overflow:hidden; }
        .detail-image img { width:100%; height:100%; object-fit:cover; }
        .no-image-large { width:100%; height:100%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; border-radius:10px; }

        .detail-info { text-align:left; margin-bottom:20px; }
        .detail-row { display:flex; justify-content:space-between; margin-bottom:10px; padding:8px 0; border-bottom:1px solid #eee; }
        .detail-row label { font-weight:bold; color:#666; }
        .detail-row span { color:#333; }
        .status.in-stock { color:#27ae60; font-weight:bold; }
        .status.out-of-stock { color:#e74c3c; font-weight:bold; }

        .action-buttons { display:flex; gap:10px; justify-content:center; }
        .btn-view-all, .btn-add-new { padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold; transition:background .3s; }
        .btn-view-all { background:#3498db; color:white; }
        .btn-view-all:hover { background:#2c80b4; }
        .btn-add-new { background:#27ae60; color:white; }
        .btn-add-new:hover { background:#1e8449; }

        .no-results, .no-selection { text-align:center; padding:40px; color:#666; }

        @media (max-width: 1200px) {
          .search-results-container { grid-template-columns:1fr; height:auto; }
          .search-controls { flex-direction:column; align-items:stretch; }
          .main { margin-left:0; }
          .sidebar { display:none; }
        }
      `}</style>
    </div>
  );
};

export default Search;
