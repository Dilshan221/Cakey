import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../../services/api";

const MAX_IMAGE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: "",        // legacy
    category: "",     // NEW
    isActive: true,   // NEW
  });

  const [imagePreview, setImagePreview] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState(["Birthday Cakes","Special Cakes","Cupcakes and Others"]); // fallback

  const fileInputRef = useRef(null);

  // fetch categories (nice UX, but optional)
  useEffect(() => {
    (async () => {
      try {
        const cats = await apiService.listProductCategories?.();
        if (Array.isArray(cats) && cats.length) setCategories(cats);
      } catch {/* ignore */}
    })();
  }, []);

  const setField = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((e) => ({ ...e, [id]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Product name is required";
    if (!form.description?.trim()) e.description = "Description is required";

    const price = Number(form.price);
    if (!form.price?.toString().trim()) e.price = "Price is required";
    else if (isNaN(price) || price < 0) e.price = "Enter a valid price";

    const qty = Number(form.quantity);
    if (!form.quantity?.toString().trim()) e.quantity = "Quantity is required";
    else if (isNaN(qty) || qty < 0) e.quantity = "Enter a valid quantity";

    if (!form.image) e.image = "Please upload a product image";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatPriceOnBlur = () => {
    if (form.price === "") return;
    const n = Number(form.price);
    if (!isNaN(n)) setField("price", n.toFixed(2));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const readAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = (e) => resolve(e.target.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const acceptImage = async (file) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, image: "Only JPG, PNG, or WEBP allowed" }));
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_IMAGE_MB) {
      setErrors((e) => ({ ...e, image: `Image must be ≤ ${MAX_IMAGE_MB}MB` }));
      return;
    }
    const dataURL = await readAsDataURL(file);
    setImagePreview(dataURL);
    setHasImage(true);
    setField("image", dataURL);
  };

  const onFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (f) await acceptImage(f);
  };

  const onDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add("dragover"); };
  const onDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); };

  const onDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
      await acceptImage(f);
    }
  };

  const removeImage = (e) => {
    e?.stopPropagation();
    setImagePreview("");
    setHasImage(false);
    setField("image", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.quantity), // NEW key
      imageUrl: form.image,         // NEW key
      category: form.category?.trim(),
      isActive: !!form.isActive,
      // legacy (kept for any other consumers)
      quantity: Number(form.quantity),
      image: form.image,
    };

    try {
      setSubmitting(true);
      await apiService.createProduct(payload);
      alert("Product added successfully!");
      navigate("/admin/product/dashboard");
    } catch (err) {
      alert(err?.data?.message || err?.message || "Error while adding product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-form-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo"><h2>Cake &amp; Bake</h2></div>
        <nav>
          <Link to="/admin/product/dashboard">View Products</Link>
          <Link to="/admin/product/form" className="active">+ Add Product</Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="page-head">
          <div>
            <h1>Add Product</h1>
            <p className="subtitle">Create a new item for your store</p>
          </div>
          <div className="actions">
            <Link className="btn ghost" to="/admin/product/dashboard">Cancel</Link>
            <button type="submit" form="addProductForm" className="btn primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Save Product"}
            </button>
          </div>
        </header>

        <form id="addProductForm" onSubmit={handleSubmit} className="card">
          <div className="grid-2">
            {/* Left */}
            <section className="panel">
              <h3 className="panel-title">Details</h3>

              <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Product Name</label>
                <input id="name" type="text" placeholder="e.g. Chocolate Fudge Cake"
                  value={form.name} onChange={(e) => setField("name", e.target.value)} />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className={`form-group ${errors.description ? "has-error" : ""}`}>
                <label htmlFor="description">Description <span className="muted">(max 300 chars)</span></label>
                <textarea id="description" value={form.description}
                  onChange={(e) => setField("description", e.target.value.slice(0, 300))}
                  placeholder="Describe flavor, size, ingredients, etc." rows={5} />
                <div className="hint">{form.description.length}/300</div>
                {errors.description && <div className="error">{errors.description}</div>}
              </div>

              <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}>
                <div className={`form-group ${errors.price ? "has-error" : ""}`}>
                  <label htmlFor="price">Price (Rs)</label>
                  <div className="input-adorn">
                    <span>Rs</span>
                    <input id="price" type="number" min="0" step="0.01" placeholder="0.00"
                      value={form.price} onChange={(e) => setField("price", e.target.value)} onBlur={formatPriceOnBlur}/>
                  </div>
                  {errors.price && <div className="error">{errors.price}</div>}
                </div>

                <div className={`form-group ${errors.quantity ? "has-error" : ""}`}>
                  <label htmlFor="quantity">Stock</label>
                  <input id="quantity" type="number" min="0" placeholder="e.g. 24"
                    value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} />
                  {errors.quantity && <div className="error">{errors.quantity}</div>}
                </div>
              </div>

              <div className="form-row" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" value={form.category} onChange={(e) => setField("category", e.target.value)}>
                    <option value="">— Select —</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="isActive">Status</label>
                  <select id="isActive" value={form.isActive ? "1" : "0"}
                          onChange={(e) => setField("isActive", e.target.value === "1")}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Right */}
            <section className="panel">
              <h3 className="panel-title">Image</h3>

              <div className={`upload ${hasImage ? "has-image" : ""} ${errors.image ? "has-error" : ""}`}
                   onClick={openFilePicker} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                   role="button" tabIndex={0}
                   onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFilePicker()}
                   aria-label="Upload product image">
                {!hasImage ? (
                  <div className="upload-inner">
                    <div className="upload-icon">📷</div>
                    <p className="upload-title">Click to upload or drag & drop</p>
                    <p className="upload-sub">JPG, PNG, WEBP — up to {MAX_IMAGE_MB}MB</p>
                    <button type="button" className="btn small">Browse</button>
                    <input ref={fileInputRef} type="file" className="file-input"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={onFileChange} />
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={imagePreview} alt="Preview" className="preview" />
                    <div className="preview-actions">
                      <button type="button" className="btn ghost small" onClick={openFilePicker}>Change</button>
                      <button type="button" className="btn danger small" onClick={removeImage}>Remove</button>
                    </div>
                    <input ref={fileInputRef} type="file" className="file-input"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={onFileChange} />
                  </div>
                )}
              </div>
              {errors.image && <div className="error">{errors.image}</div>}

              <ul className="tips">
                <li>Use a bright, well-lit photo with the product centered.</li>
                <li>Recommended ratio 4:3, minimum width 800px for sharp cards.</li>
              </ul>
            </section>
          </div>

          {/* Footer actions */}
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={() => navigate("/admin/product/dashboard")}>
              Cancel
            </button>
            <button className="btn primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Save Product"}
            </button>
          </div>
        </form>
      </div>

      <style>{css}</style>
    </div>
  );
}
/* ------------------------------ CSS ------------------------------ */
const css = `
.product-form-page { display: flex; background: #fdfdfd; color: #333; min-height: 100vh; font-family: "Arial", sans-serif; }

/* Sidebar */
.sidebar {
  width: 250px; background: #ffe9dc; min-height: 100vh; padding: 20px; box-sizing: border-box;
  position: sticky; top: 0; border-right: 1px solid #f0d8cd;
}
.sidebar .logo { text-align: center; margin-bottom: 30px; }
.sidebar .logo h2 { font-family: "Brush Script MT", cursive; color: #e74c3c; }
.sidebar nav a {
  display: block; text-decoration: none; padding: 12px 10px; color: #333;
  margin: 5px 0; border-radius: 8px; transition: .2s; font-weight: 500;
}
.sidebar nav a:hover, .sidebar nav a.active { background: #ff6f61; color: #fff; }

/* Main */
.main { margin-left: 250px; padding: 28px; width: 100%; box-sizing: border-box; }
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
.page-head h1 { font-size: 28px; color: #e74c3c; margin: 0; }
.subtitle { margin: 6px 0 0; color: #666; font-size: 13px; }
.actions { display: flex; gap: 10px; }

/* Card wrapper */
.card {
  background: #fff; border: 1px solid #f0d8cd; border-radius: 16px; padding: 18px;
  box-shadow: 0 6px 14px rgba(0,0,0,.04);
}

/* Grid 2 cols */
.grid-2 { display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px; }
@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

/* Panels */
.panel { display: flex; flex-direction: column; gap: 14px; }
.panel-title { margin: 0 0 2px; font-size: 16px; color: #b66a5e; }

/* Form */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.has-error input, .form-group.has-error textarea { border-color: #e74c3c; }
label { font-weight: 700; color: #333; font-size: 13px; }
.muted { color: #888; font-weight: 400; }
.hint { font-size: 12px; color: #888; text-align: right; }

input, textarea {
  width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; font-size: 14px; background: #fff;
}
textarea { resize: vertical; min-height: 90px; }

/* Input adornment */
.input-adorn { position: relative; }
.input-adorn > span {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #888; font-size: 13px;
}
.input-adorn input { padding-left: 36px; }

/* Image upload */
.upload {
  border: 2px dashed #d9c1b6; border-radius: 14px; padding: 18px; text-align: center; cursor: pointer; transition: .2s;
  background: #fff8f5;
}
.upload.dragover, .upload:hover { border-color: #ff6f61; }
.upload.has-image { border-style: solid; border-color: #27ae60; background: #fbfffb; }
.upload .file-input { display: none; }

.upload-inner { display: grid; place-items: center; gap: 8px; }
.upload-icon { font-size: 26px; }
.upload-title { margin: 0; font-weight: 700; }
.upload-sub { margin: 0; color: #777; font-size: 12px; }

.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.preview {
  max-width: 100%; width: 100%; height: auto; aspect-ratio: 4/3; object-fit: cover; border-radius: 10px; background: #faf6f4;
}
.preview-actions { display: flex; gap: 8px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none;
  border: 1px solid #e7c2b3; background: #fff; color: #333;
}
.btn.small { padding: 8px 10px; font-size: 13px; }
.btn.primary { background: #ff6f61; color: #fff; border-color: #ff6f61; }
.btn.primary:hover { filter: brightness(.95); }
.btn.ghost { background: #fff; }
.btn.danger { background: #ffe3df; color: #b13426; border-color: #ffc8c1; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

/* Errors */
.error { color: #b00020; font-size: 12px; margin-top: -2px; }

/* Footer actions (sticky on small screens) */
.form-actions {
  display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px; border-top: 1px solid #f7e4dc; margin-top: 14px;
}
@media (max-width: 600px) {
  .form-actions {
    position: sticky; bottom: 0; background: #fff; padding: 12px; border: 1px solid #f0d8cd; border-radius: 12px; z-index: 1;
  }
}

/* Spinner */
.spinner {
  width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;
