import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

export default function ProductDashboard() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [allCategories, setAllCategories] = useState([""]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await apiService.listProductCategories?.();
        if (Array.isArray(cats) && cats.length) setAllCategories(["", ...cats]);
      } catch {
        setAllCategories([""]); // fallback to "All"
      }
    })();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const query = { q, category, sort, page, limit };
      const data = await apiService.listProducts(query);
      const arr = Array.isArray(data) ? data : data?.items || [];
      setItems(arr);
      setTotal(data?.total ?? arr.length);
      setPages(data?.pages ?? 1);
    } catch (e) {
      setError(
        e?.data?.error ||
          e?.data?.message ||
          e?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); /* eslint-disable-next-line */
  }, [q, category, sort, page, limit]);

  const onPage = (next) => {
    setPage((p) => {
      const n =
        typeof next === "number" ? next : p + (next === "prev" ? -1 : 1);
      return Math.max(1, Math.min(pages, n));
    });
  };

  // fallback inference (if categories endpoint not used)
  const inferred = useMemo(() => {
    const s = new Set();
    items.forEach((it) => it?.category && s.add(it.category));
    return ["", ...[...s]];
  }, [items]);

  const categories = allCategories.length > 1 ? allCategories : inferred;

  return (
    <div className="product-dashboard">
      <aside className="sidebar">
        <div className="logo">
          <h2>Cake &amp; Bake</h2>
        </div>
        <nav>
          <Link to="/admin/product/dashboard" className="active">
            View Products
          </Link>
          <Link to="/admin/product/form">+ Add Product</Link>
        </nav>
      </aside>

      <main className="main">
        <header className="page-head">
          <h1>Products</h1>
          <div className="actions">
            <Link to="/admin/product/form" className="btn primary">
              + Add Product
            </Link>
          </div>
        </header>

        <section className="toolbar">
          <div className="control">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search name, description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="control">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              {categories.map((c) => (
                <option key={c || "all"} value={c}>
                  {c ? c : "All"}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-price">Price: High → Low</option>
              <option value="price">Price: Low → High</option>
              <option value="name">Name: A → Z</option>
              <option value="-name">Name: Z → A</option>
            </select>
          </div>
          <div className="control">
            <label>Per page</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error ? (
          <div className="error">{error}</div>
        ) : loading ? (
          <CardGridSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="grid">
              {items.map((p) => (
                <ProductCard
                  key={p._id || p.id || p.name}
                  name={p.name}
                  description={p.description}
                  price={p.price}
                  stock={p.stock ?? p.quantity ?? 0}
                  imageUrl={p.imageUrl ?? p.image ?? ""}
                  category={p.category}
                  isActive={p.isActive ?? true}
                />
              ))}
            </section>

            <section className="pagination">
              <button
                className="btn ghost"
                disabled={page <= 1}
                onClick={() => onPage("prev")}
              >
                ← Prev
              </button>
              <span className="page-indicator">
                Page {page} / {pages} {total ? `• ${total} items` : ""}
              </span>
              <button
                className="btn ghost"
                disabled={page >= pages}
                onClick={() => onPage("next")}
              >
                Next →
              </button>
            </section>
          </>
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

function ProductCard({
  name,
  description,
  price,
  stock,
  imageUrl,
  category,
  isActive,
}) {
  return (
    <article className={`card ${!isActive ? "inactive" : ""}`}>
      <div className="thumb">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="placeholder">No Image</div>
        )}
        {!isActive && <span className="badge muted">Inactive</span>}
        {stock <= 5 && <span className="badge warn">Low stock</span>}
      </div>
      <div className="body">
        <h3 title={name}>{name}</h3>
        {category && <div className="chip">{category}</div>}
        <p className="desc" title={description}>
          {description || "—"}
        </p>
      </div>
      <footer className="meta">
        <div className="price">Rs {Number(price || 0).toLocaleString()}</div>
        <div className="stock">{stock} in stock</div>
      </footer>
    </article>
  );
}

function CardGridSkeleton() {
  return (
    <section className="grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="thumb" />
          <div className="body">
            <div className="line w60" />
            <div className="line w40" />
            <div className="line w80" />
          </div>
          <div className="meta">
            <div className="pill" />
            <div className="pill" />
          </div>
        </div>
      ))}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <h3>No products found</h3>
      <p>Try adjusting your search or add a new product.</p>
      <Link className="btn primary" to="/admin/product/form">
        + Add Product
      </Link>
    </div>
  );
}

const styles = `
.product-dashboard {
  display: flex;
  background: #fdfdfd;
  color: #333;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #ffe9dc;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  border-right: 1px solid #f0d8cd;
}
.sidebar .logo { text-align: center; margin-bottom: 30px; }
.sidebar .logo h2 { font-family: "Brush Script MT", cursive; color: #e74c3c; }
.sidebar nav a {
  display: block; text-decoration: none; padding: 12px 10px; color: #333;
  margin: 5px 0; border-radius: 6px; transition: 0.3s; font-weight: 500;
}
.sidebar nav a:hover, .sidebar nav a.active { background: #ff6f61; color: white; }

/* Main */
.main { margin-left: 250px; padding: 30px; width: 100%; box-sizing: border-box; }
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-head h1 { font-size: 28px; color: #e74c3c; margin: 0; }
.actions .btn { text-decoration: none; }

/* Toolbar */
.toolbar {
  display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 12px;
  background: #fff; padding: 14px; border-radius: 12px; margin-bottom: 16px;
  border: 1px solid #f0d8cd;
}
.control label { display: block; font-size: 12px; color: #666; margin-bottom: 6px; }
.control input, .control select {
  width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 14px;
  background: #fff;
}

/* Grid */
.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.card {
  background: #fff; border: 1px solid #f0d8cd; border-radius: 14px; overflow: hidden;
  display: flex; flex-direction: column; transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,.06); }
.card.inactive { opacity: .75; }
.card .thumb { position: relative; aspect-ratio: 4/3; background: #faf6f4; display: grid; place-items: center; }
.card .thumb img { width: 100%; height: 100%; object-fit: cover; }
.placeholder { color: #aaa; font-size: 14px; }
.badge {
  position: absolute; top: 10px; left: 10px; background: #ff6f61; color: #fff; border-radius: 999px;
  padding: 5px 8px; font-size: 11px; font-weight: 700;
}
.badge.warn { right: 10px; left: auto; background: #e67e22; }
.badge.muted { background: #999; }

.card .body { padding: 12px; }
.card .body h3 { margin: 0 0 6px; font-size: 16px; line-height: 1.2; }
.chip { display: inline-block; border: 1px solid #f0d8cd; color: #b66a5e; border-radius: 999px; padding: 2px 8px; font-size: 11px; }
.desc {
  font-size: 13px; color: #666; margin: 8px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.card .meta {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px; border-top: 1px solid #f7e4dc; margin-top: auto;
}
.price { font-weight: 700; }
.stock { font-size: 13px; color: #666; }

/* Skeleton */
.skeleton { animation: pulse 1.3s ease-in-out infinite; }
.skeleton .thumb { background: #f3ece8; }
.skeleton .line { height: 12px; background: #eee; border-radius: 6px; margin: 8px 0; }
.skeleton .line.w60 { width: 60%; }
.skeleton .line.w40 { width: 40%; }
.skeleton .line.w80 { width: 80%; }
.skeleton .pill { width: 80px; height: 18px; background: #eee; border-radius: 999px; }
@keyframes pulse { 0%{opacity:.9} 50%{opacity:.5} 100%{opacity:.9} }

/* Pagination */
.pagination { display: flex; gap: 10px; align-items: center; justify-content: center; margin: 18px 0; }
.page-indicator { font-size: 14px; color: #555; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none;
  border: 1px solid #e7c2b3; background: #fff; color: #333;
}
.btn.ghost { background: #fff; }
.btn.primary { background: #ff6f61; color: #fff; border-color: #ff6f61; }
.btn.primary:hover { filter: brightness(.95); }
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* Empty / Error */
.empty, .error {
  background: #fff; border: 1px solid #f0d8cd; border-radius: 14px; padding: 32px; text-align: center;
}
.error { color: #b00020; }
`;
