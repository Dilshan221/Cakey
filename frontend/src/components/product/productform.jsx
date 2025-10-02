import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const ProductForm = () => {
  const [imagePreview, setImagePreview] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageUploadClick = () => {
    if (!isSubmitting) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1048576) {
        alert("Image size should be less than 1MB");
        return;
      }
      previewImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#ff6f61";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = hasImage ? "#27ae60" : "#ccc";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#27ae60";

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.size > 1048576) {
        alert("Image size should be less than 1MB");
        return;
      }
      previewImage(file);
    }
  };

  const previewImage = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setHasImage(true);
    };
    reader.onerror = () => {
      alert("Error reading image file");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (e) => {
    if (e) e.stopPropagation();
    setImagePreview("");
    setHasImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasImage) {
      alert("Please upload a product image");
      return;
    }

    const formData = {
      name: e.target.productName.value.trim(),
      description: e.target.productDesc.value.trim(),
      price: parseFloat(e.target.price.value),
      image: imagePreview, // base64; switch to FormData if backend expects file
      quantity: parseInt(e.target.quantity.value, 10),
      stock: parseInt(e.target.quantity.value, 10),
    };

    if (!formData.name || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    if (Number.isNaN(formData.price) || Number.isNaN(formData.quantity)) {
      alert("Please enter valid numbers for price and quantity");
      return;
    }
    if (formData.price <= 0 || formData.quantity <= 0) {
      alert("Price and quantity must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiService.createProduct(formData);
      if (result?._id || result?.id || result?.name) {
        alert("Product added successfully!");
        e.target.reset();
        removeImage();
        navigate("/cadmin/product/dashboard", { replace: true });
      } else {
        alert("Product added, but response was unexpected.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(
        error?.message ||
          "Error adding product. Make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <aside className="sidebar">
        <div className="logo">
          <h2>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin/product/dashboard">Dashboard</Link>
          
          
          <Link to="/cadmin/product/form" className="active">
            Products
          </Link>
          <Link to="/cadmin/product/reports">Reports</Link>
          <Link to="/cadmin/product/search">Search Engine</Link>
          
        </nav>
      </aside>

      <div className="main">
        <h1>Add Product</h1>

        <div className="form-container">
          <form id="addProductForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                placeholder="Enter product name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="productDesc">Product Description *</label>
              <textarea
                id="productDesc"
                name="productDesc"
                placeholder="Enter product description"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="image-upload-container">
              <label className="image-upload-label">Product Image *</label>
              <div
                className={`image-upload-box ${hasImage ? "has-image" : ""}`}
                id="imageUploadBox"
                onClick={handleImageUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
              >
                {!hasImage && (
                  <>
                    <p>Click to upload or drag and drop</p>
                    <p>PNG, JPG up to 1MB</p>
                  </>
                )}
                <input
                  type="file"
                  id="productImage"
                  className="image-upload-input"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                {hasImage && (
                  <img
                    id="imagePreview"
                    className="image-preview"
                    src={imagePreview}
                    alt="Product preview"
                    style={{ display: "block" }}
                  />
                )}
                {hasImage && !isSubmitting && (
                  <div
                    className="remove-image"
                    id="removeImage"
                    onClick={removeImage}
                    style={{ display: "block" }}
                    role="button"
                    tabIndex={0}
                  >
                    Remove image
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity Level *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                placeholder="Enter stock quantity"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Product Price (Rs.) *</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                placeholder="Enter product price"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Product..." : "Add Product"}
            </button>

            <div style={{ marginTop: "10px" }}>
              <Link
                to="/cadmin/product/dashboard"
                style={{ color: "#3498db", textDecoration: "none" }}
              >
                ← Back to Products
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        body { margin: 0; font-family: "Arial", sans-serif; background: #fdfdfd; color: #333; display: flex; }
        .linklike { background: none; border: none; padding: 0; color: #0a58ca; text-decoration: underline; cursor: pointer; display: block; text-align: left; font: inherit; margin: 5px 0; }
        .linklike:hover { text-decoration: none; }

        .sidebar { width: 250px; background: #ffe9dc; min-height: 100vh; padding: 20px; box-sizing: border-box; position: fixed; top: 0; left: 0; }
        .sidebar .logo { text-align: center; margin-bottom: 30px; }
        .sidebar .logo h2 { font-family: "Brush Script MT", cursive; color: #e74c3c; }
        .sidebar nav a { display: block; text-decoration: none; padding: 12px 10px; color: #333; margin: 5px 0; border-radius: 6px; transition: 0.3s; font-weight: 500; }
        .sidebar nav a:hover, .sidebar nav a.active { background: #ff6f61; color: white; }

        .main { margin-left: 250px; padding: 30px; width: 100%; }
        .main h1 { font-size: 28px; margin-bottom: 20px; color: #e74c3c; }
        .form-container { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); max-width: 600px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: bold; color: #333; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px; box-sizing: border-box; }
        .form-group textarea { resize: none; height: 80px; }
        .btn-submit { background: #27ae60; color: white; padding: 10px 18px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; transition: background 0.3s; width: 100%; }
        .btn-submit:hover:not(:disabled) { background: #1e8449; }
        .btn-submit:disabled { background: #95a5a6; cursor: not-allowed; }
        .image-upload-container { margin-bottom: 15px; }
        .image-upload-label { display: block; margin-bottom: 6px; font-weight: bold; color: #333; }
        .image-upload-box { border: 2px dashed #ccc; border-radius: 6px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.3s; }
        .image-upload-box:hover:not(:disabled) { border-color: #ff6f61; }
        .image-upload-box p { margin: 0; color: #666; }
        .image-upload-box.has-image { border-style: solid; border-color: #27ae60; }
        .image-preview { max-width: 100%; max-height: 200px; margin-top: 15px; border-radius: 4px; }
        .image-upload-input { display: none; }
        .remove-image { color: #e74c3c; cursor: pointer; margin-top: 10px; }
        .remove-image:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default ProductForm;
