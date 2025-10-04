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
    image: "", // legacy (base64 or URL)
    category: "",
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Default categories + API-loaded categories
  const [categories, setCategories] = useState([
    "Birthday Cakes",
    "Special Cakes",
    "Cupcakes and Others",
  ]);

  // Inline "add category" state
  const [newCategory, setNewCategory] = useState("");
  const [catError, setCatError] = useState("");

  const fileInputRef = useRef(null);

  // Fetch categories (optional enhancement)
  useEffect(() => {
    (async () => {
      try {
        const cats = await apiService.listProductCategories?.();
        if (Array.isArray(cats) && cats.length) {
          // Merge unique with defaults
          const set = new Set([...categories, ...cats]);
          setCategories(Array.from(set));
        }
      } catch {
        /* ignore, keep defaults */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------- Helpers -----------------
  const setField = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((e) => ({ ...e, [id]: "" }));
  };

  const readAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = (e) => resolve(e.target.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const openFilePicker = () => fileInputRef.current?.click();

  const numberOnly = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  // ----------------- Validation -----------------
  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Product name is required.";
    if (!form.description?.trim()) e.description = "Description is required.";

    const price = Number(form.price);
    if (!form.price?.toString().trim()) e.price = "Price is required.";
    else if (isNaN(price) || price < 0)
      e.price = "Enter a valid non-negative price.";

    const qty = Number(form.quantity);
    if (!form.quantity?.toString().trim()) e.quantity = "Stock is required.";
    else if (isNaN(qty) || qty < 0)
      e.quantity = "Enter a valid non-negative stock.";

    if (!form.image) e.image = "Please upload a product image.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatPriceOnBlur = () => {
    if (form.price === "") return;
    const n = Number(form.price);
    if (!isNaN(n)) setField("price", n.toFixed(2));
  };

  // ----------------- Image handling -----------------
  const acceptImage = async (file) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, image: "Only JPG, PNG, or WEBP allowed." }));
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_IMAGE_MB) {
      setErrors((e) => ({ ...e, image: `Image must be ≤ ${MAX_IMAGE_MB}MB.` }));
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

  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
  };
  const onDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (fileInputRef.current)
        fileInputRef.current.files = e.dataTransfer.files;
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

  // ----------------- Category add -----------------
  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setCatError("Enter a category name.");
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCatError("Category already exists.");
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setField("category", trimmed);
    setNewCategory("");
    setCatError("");
  };

  const handleAddCategoryKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
  };

  // ----------------- Submit -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.quantity),
      imageUrl: form.image,
      category: form.category?.trim(),
      isActive: !!form.isActive,
      // legacy for compatibility
      quantity: Number(form.quantity),
      image: form.image,
    };

    try {
      setSubmitting(true);
      await apiService.createProduct(payload);
      alert("✅ Product added successfully!");
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
      <div className="sidebar">
        <div className="logo">
          <h2>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin/product/dashboard" className="no-underline">
            Dashboard
          </Link>
          <Link to="/cadmin/product/form" className="active no-underline">
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

      {/* Main */}
      <div className="main">
        <header className="page-head">
          <div>
            <h1>Add Product</h1>
            <p className="subtitle">Create a new item for your store</p>
          </div>
          <div className="actions">
            <Link className="btn ghost" to="/admin/product/dashboard">
              Cancel
            </Link>
            <button
              type="submit"
              form="addProductForm"
              className="btn primary"
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : "Save Product"}
            </button>
          </div>
        </header>

        <form
          id="addProductForm"
          onSubmit={handleSubmit}
          className="card"
          noValidate
        >
          <div className="grid-2">
            {/* Left */}
            <section className="panel">
              <h3 className="panel-title">Details</h3>

              <div className={`form-group ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Chocolate Fudge Cake"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  maxLength={80}
                  required
                />
                <div className="hint">{form.name.length}/80</div>
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div
                className={`form-group ${
                  errors.description ? "has-error" : ""
                }`}
              >
                <label htmlFor="description">
                  Description <span className="muted">(max 300 chars)</span>
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setField("description", e.target.value.slice(0, 300))
                  }
                  placeholder="Describe flavor, size, ingredients, etc."
                  rows={5}
                  required
                />
                <div className="hint">{form.description.length}/300</div>
                {errors.description && (
                  <div className="error">{errors.description}</div>
                )}
              </div>

              <div className="form-row two">
                <div
                  className={`form-group ${errors.price ? "has-error" : ""}`}
                >
                  <label htmlFor="price">Price (Rs)</label>
                  <div className="input-adorn">
                    <span>Rs</span>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                      onBlur={formatPriceOnBlur}
                      onKeyDown={numberOnly}
                      inputMode="decimal"
                      required
                    />
                  </div>
                  {errors.price && <div className="error">{errors.price}</div>}
                </div>

                <div
                  className={`form-group ${errors.quantity ? "has-error" : ""}`}
                >
                  <label htmlFor="quantity">Stock</label>
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    placeholder="e.g. 24"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    onKeyDown={numberOnly}
                    inputMode="numeric"
                    required
                  />
                  {errors.quantity && (
                    <div className="error">{errors.quantity}</div>
                  )}
                </div>
              </div>

              <div className="form-row two">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Inline Add Category */}
                  <div className="add-cat">
                    <input
                      type="text"
                      placeholder="Add category…"
                      value={newCategory}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        setCatError("");
                      }}
                      onKeyDown={handleAddCategoryKey}
                      maxLength={40}
                    />
                    <button
                      type="button"
                      className="btn small"
                      onClick={addCategory}
                    >
                      + Add
                    </button>
                  </div>
                  {catError && <div className="error">{catError}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="isActive">Status</label>
                  <select
                    id="isActive"
                    value={form.isActive ? "1" : "0"}
                    onChange={(e) =>
                      setField("isActive", e.target.value === "1")
                    }
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Right */}
            <section className="panel">
              <h3 className="panel-title">Image</h3>

              <div
                className={`upload ${hasImage ? "has-image" : ""} ${
                  errors.image ? "has-error" : ""
                }`}
                onClick={openFilePicker}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && openFilePicker()
                }
                aria-label="Upload product image"
                title="Click to upload or drag & drop an image"
              >
                {!hasImage ? (
                  <div className="upload-inner">
                    <div className="upload-icon">📷</div>
                    <p className="upload-title">
                      Click to upload or drag & drop
                    </p>
                    <p className="upload-sub">
                      JPG, PNG, WEBP — up to {MAX_IMAGE_MB}MB
                    </p>
                    <button type="button" className="btn small">
                      Browse
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-input"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      onChange={onFileChange}
                    />
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={imagePreview} alt="Preview" className="preview" />
                    <div className="preview-actions">
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={openFilePicker}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="btn danger small"
                        onClick={removeImage}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-input"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      onChange={onFileChange}
                    />
                  </div>
                )}
              </div>
              {errors.image && <div className="error">{errors.image}</div>}

              <ul className="tips">
                <li>Use a bright, well-lit photo with the product centered.</li>
                <li>
                  Recommended ratio 4:3, minimum width 800px for sharp cards.
                </li>
              </ul>
            </section>
          </div>

          {/* Footer actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => navigate("/admin/product/dashboard")}
            >
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
:root{
  --rose:#ff6f61;
  --rose-600:#e65f53;
  --brand:#e74c3c;
  --ink:#333;
  --muted:#666;
  --line:#f0d8cd;
  --card:#fff;
  --bg:#fff7f3;
  --shadow:0 10px 24px rgba(0,0,0,.06);
  --ring:#ffd7d2;
}

*{box-sizing:border-box}
html,body{height:100%}
body{background:#fdfdfd;color:var(--ink);}

.product-form-page{
  display:flex; min-height:100vh; font-family: "Inter", "Arial", sans-serif;
  background:
    radial-gradient(1200px 800px at -10% -20%, #fff3ee 0%, transparent 55%),
    radial-gradient(1000px 700px at 120% 10%, #fff0ec 0%, transparent 50%),
    #fff;
}

/* Sidebar */
.sidebar{
  width:260px; background:#ffe9dc; min-height:100vh; padding:24px; position:sticky; top:0; border-right:1px solid var(--line);
}
.sidebar .logo{ text-align:center; margin-bottom:24px; }
.sidebar .logo h2{ font-family:"Brush Script MT", cursive; color:var(--brand); margin:0; letter-spacing:.5px; }
.sidebar nav a{
  display:block; text-decoration:none; padding:12px 12px; color:var(--ink); margin:6px 0;
  border-radius:10px; transition:.2s; font-weight:600;
}
.sidebar nav a:hover, .sidebar nav a.active{ background:var(--rose); color:#fff; transform: translateY(-1px); }

/* Main */
.main{ margin-left:260px; padding:28px; width:100%; }
.page-head{
  display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px;
  background: linear-gradient(180deg, #fff 0%, #fff7f3 100%); padding:16px 18px; border:1px solid var(--line); border-radius:16px;
}
.page-head h1{ font-size:28px; color:var(--brand); margin:0; }
.subtitle{ margin:6px 0 0; color:var(--muted); font-size:13px; }
.actions{ display:flex; gap:10px; }

/* Card */
.card{
  background:var(--card); border:1px solid var(--line); border-radius:18px; padding:18px;
  box-shadow:var(--shadow);
}

/* Grid */
.grid-2{ display:grid; grid-template-columns: 1.15fr .85fr; gap:18px; }
@media (max-width: 980px){ .grid-2{ grid-template-columns:1fr; } }

/* Panels */
.panel{ display:flex; flex-direction:column; gap:14px; }
.panel-title{ margin:0 0 2px; font-size:15px; color:#b66a5e; letter-spacing:.3px; }

/* Form Fields */
.form-row.two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:680px){ .form-row.two{ grid-template-columns:1fr; } }

.form-group{ display:flex; flex-direction:column; gap:6px; }
.form-group.has-error input,
.form-group.has-error textarea,
.upload.has-error{ border-color:#e74c3c !important; box-shadow:0 0 0 3px rgba(231,76,60,.10); }

label{ font-weight:700; color:var(--ink); font-size:13px; }
.muted{ color:#888; font-weight:400; }
.hint{ font-size:12px; color:#888; text-align:right; }

input, textarea, select{
  width:100%; padding:12px 12px; border-radius:12px; border:1px solid #e8e1dc; font-size:14px; background:#fff;
  transition:border-color .15s, box-shadow .15s, background .15s;
}
textarea{ resize:vertical; min-height:96px; }
input:focus, textarea:focus, select:focus{
  outline:none; border-color:var(--rose); box-shadow:0 0 0 4px var(--ring);
}

/* Input adornment */
.input-adorn{ position:relative; }
.input-adorn>span{
  position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#888; font-size:13px;
}
.input-adorn input{ padding-left:36px; }

/* Category add row */
.add-cat{ display:flex; gap:8px; margin-top:8px; }
.add-cat input{
  flex:1; padding:10px 12px; border-radius:10px; border:1px solid #e8e1dc; font-size:14px;
}
.add-cat input:focus{ outline:none; border-color:var(--rose); box-shadow:0 0 0 3px var(--ring); }

/* Upload */
.upload{
  border:2px dashed #e5cfc5; border-radius:14px; padding:18px; text-align:center; cursor:pointer; transition:.2s;
  background:#fff8f5; outline:none;
}
.upload:hover, .upload.dragover{ border-color:var(--rose); box-shadow:0 0 0 4px var(--ring); }
.upload.has-image{ border-style:solid; border-color:#27ae60; background:#fbfffb; }
.upload .file-input{ display:none; }

.upload-inner{ display:grid; place-items:center; gap:8px; }
.upload-icon{ font-size:26px; }
.upload-title{ margin:0; font-weight:800; }
.upload-sub{ margin:0; color:#777; font-size:12px; }

.preview-wrap{ display:flex; flex-direction:column; align-items:center; gap:10px; }
.preview{
  max-width:100%; width:100%; height:auto; aspect-ratio:4/3; object-fit:cover; border-radius:12px; background:#faf6f4;
  border:1px solid #eee;
}
.preview-actions{ display:flex; gap:8px; }

/* Tips */
.tips{ margin:8px 0 0 18px; color:#777; font-size:12.5px; }
.tips li{ margin:4px 0; }

/* Buttons */
.btn{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:12px; font-weight:800; cursor:pointer; text-decoration:none;
  border:1px solid #eccfc4; background:#fff; color:var(--ink); transition:transform .06s, filter .15s, background .2s, border-color .2s;
}
.btn:hover{ transform:translateY(-1px); }
.btn.small{ padding:8px 10px; font-size:13px; }
.btn.primary{ background:var(--rose); color:#fff; border-color:var(--rose); }
.btn.primary:hover{ filter: brightness(.96); }
.btn.ghost{ background:#fff; }
.btn.danger{ background:#ffe3df; color:#b13426; border-color:#ffc8c1; }
.btn:disabled{ opacity:.6; cursor:not-allowed; }

/* Errors */
.error{ color:#b00020; font-size:12px; margin-top:-2px; }

/* Footer actions */
.form-actions{
  display:flex; justify-content:flex-end; gap:10px; padding-top:14px; border-top:1px solid var(--line); margin-top:14px;
}
@media (max-width:600px){
  .form-actions{
    position:sticky; bottom:0; background:#fff; padding:12px; border:1px solid var(--line); border-radius:12px; z-index:1;
  }
}

/* Spinner */
.spinner{
  width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%;
  animation:spin .8s linear infinite;
}
@keyframes spin{ to{ transform:rotate(360deg); } }
`;
