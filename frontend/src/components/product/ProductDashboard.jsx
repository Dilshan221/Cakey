import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

// Normalize fields across schemas (quantity vs stock, image vs imageUrl)
const getQty = (p) => p?.quantity ?? p?.stock ?? 0;
const getImage = (p) => p?.image || p?.imageUrl || "";

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.listProducts({
        limit: 200,
        sort: "-createdAt",
      });
      setProducts(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await apiService.deleteProduct(id);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(`Error deleting product: ${err?.message || "Unknown error"}`);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      quantity: getQty(product) ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({ name: "", description: "", price: "", quantity: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProduct = async (id) => {
    if (!editFormData.name.trim() || !editFormData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }
    const priceNum = Number(editFormData.price);
    const qtyNum = Number(editFormData.quantity);
    if (priceNum <= 0 || qtyNum <= 0) {
      alert("Price and quantity must be greater than 0");
      return;
    }

    const payload = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      price: priceNum,
      quantity: qtyNum,
      stock: qtyNum,
    };

    try {
      await apiService.updateProduct(id, payload);
      alert("Product updated successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message || err?.message || "Unknown error";
      alert(`Error updating product: ${msg}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      <div className="sidebar">
        <div className="logo">
          <h2>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin/product/dashboard" className="active no-underline">
            Dashboard
          </Link>
          
          
          <Link to="/cadmin/product/form" className="no-underline">
            Products
          </Link>
          <Link to="/cadmin/product/reports" className="no-underline">
            Reports
          </Link>
          <Link to="/cadmin/product/search" className="no-underline">
            Search Engine
          </Link>
         
        </nav>
      </div>

      <div className="main">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>View Products</h1>
          <Link to="/cadmin/product/form" className="btn-add no-underline">
            + Add New Product
          </Link>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Quantity/Stock</th>
                <th>Price</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No products found.{" "}
                    <Link
                      to="/cadmin/product/form"
                      className="no-underline"
                      style={{ color: "#3498db" }}
                    >
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id?.substring(0, 8)}...</td>

                    {/* Name */}
                    <td>
                      {editingProduct === product._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          style={{ width: "100%", padding: "5px" }}
                        />
                      ) : (
                        product.name
                      )}
                    </td>

                    {/* Description */}
                    <td>
                      {editingProduct === product._id ? (
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditChange}
                          style={{
                            width: "100%",
                            padding: "5px",
                            height: "60px",
                          }}
                        />
                      ) : (
                        product.description
                      )}
                    </td>

                    {/* Quantity/Stock */}
                    <td>
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editFormData.quantity}
                          onChange={handleEditChange}
                          min="1"
                          style={{ width: "80px", padding: "5px" }}
                        />
                      ) : (
                        getQty(product)
                      )}
                    </td>

                    {/* Price */}
                    <td>
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="price"
                          value={editFormData.price}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                          style={{ width: "100px", padding: "5px" }}
                        />
                      ) : (
                        `Rs.${product.price}`
                      )}
                    </td>

                    {/* Image */}
                    <td>
                      {getImage(product) && (
                        <img
                          src={getImage(product)}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {editingProduct === product._id ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            flexDirection: "column",
                          }}
                        >
                          <button
                            className="btn btn-save"
                            onClick={() => updateProduct(product._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-cancel"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            flexDirection: "column",
                          }}
                        >
                          <button
                            className="btn btn-edit"
                            onClick={() => startEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => deleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        body { margin: 0; font-family: "Arial", sans-serif; background: #fdfdfd; color: #333; display: flex; }

        /* Buttons that look like plain text (no underline, not blue) */
        .linklike {
          background: none;
          border: none;
          padding: 0;
          color: #333;
          text-decoration: none;
          cursor: pointer;
          display: block;
          text-align: left;
          font: inherit;
          margin: 5px 0;
        }
        .linklike:hover { opacity: 0.85; }

        /* Generic helper to remove underline from Links */
        .no-underline, .no-underline:visited, .no-underline:hover, .no-underline:active {
          text-decoration: none !important;
        }

        .sidebar { width: 250px; background: #ffe9dc; min-height: 100vh; padding: 20px; box-sizing: border-box; position: fixed; top: 0; left: 0; }
        .sidebar .logo { text-align: center; margin-bottom: 30px; }
        .sidebar .logo h2 { font-family: "Brush Script MT", cursive; color: #e74c3c; }
        .sidebar nav a {
          display: block;
          text-decoration: none;
          padding: 12px 10px;
          color: #333;
          margin: 5px 0;
          border-radius: 6px;
          transition: 0.3s;
          font-weight: 500;
        }
        .sidebar nav a:hover, .sidebar nav a.active { background: #ff6f61; color: white; }

        .main { margin-left: 250px; padding: 30px; width: 100%; }
        .main h1 { font-size: 28px; margin-bottom: 20px; color: #e74c3c; }
        .btn-add { background: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold; transition: background 0.3s; display: inline-block; }
        .btn-add:hover { background: #1e8449; text-decoration: none; }

        table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
        table thead { background: #ff6f61; color: white; }
        table th, table td { padding: 14px 16px; text-align: center; border-bottom: 1px solid #eee; vertical-align: middle; }
        table tr:hover { background: #f9f9f9; }

        .btn { padding: 6px 12px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; color: white; transition: 0.3s; margin: 2px; font-weight: bold; }
        .btn-edit { background: #3498db; } .btn-edit:hover { background: #2c80b4; }
        .btn-delete { background: #e74c3c; } .btn-delete:hover { background: #c0392b; }
        .btn-save { background: #27ae60; } .btn-save:hover { background: #1e8449; }
        .btn-cancel { background: #95a5a6; } .btn-cancel:hover { background: #7f8c8d; }

        input, textarea { border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
        input:focus, textarea:focus { outline: none; border-color: #3498db; }
      `}</style>
    </div>
  );
};

export default ProductDashboard;
