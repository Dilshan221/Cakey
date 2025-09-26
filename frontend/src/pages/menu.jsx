import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiService } from "../services/api";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMG = "/assets/img/menu/price1.jpg";

/* ------------------------------ Cart utils ------------------------------ */
const CART_KEY = "cb_cart";
const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));
const addToCart = (product, qty = 1) => {
  const cart = getCart();
  const idx = cart.findIndex((x) => x._id === product._id);
  if (idx >= 0) cart[idx].qty += qty;
  else
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty,
    });
  setCart(cart);
  return cart;
};

/* ------------------------------ Data hook ------------------------------- */
function useProducts({
  category,
  q,
  page,
  limit,
  isActive = true,
  sort = "-createdAt",
}) {
  const [state, setState] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await apiService.listProducts({
          category,
          q,
          page,
          limit,
          isActive,
          sort,
        });
        if (!cancelled) {
          setState({
            items: data.items || [],
            page: data.page || 1,
            pages: data.pages || 1,
            total: data.total || 0,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: err.message || "Failed to load products",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, q, page, limit, isActive, sort]);
  return state;
}

/* ------------------------------- Pagination ----------------------------- */
const Pagination = ({ page, pages, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div className="cb-pager">
      <button
        className="cb-btn ghost"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        « Prev
      </button>
      <span className="cb-pager-info">
        Page {page} / {pages}
      </span>
      <button
        className="cb-btn ghost"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Next »
      </button>
    </div>
  );
};

/* --------------------------------- Card --------------------------------- */
const MenuItem = ({ item, onAdd, onBuy, onOpen }) => {
  const img = item.imageUrl?.trim() ? item.imageUrl : PLACEHOLDER_IMG;
  const price = useMemo(() => {
    const p = Number(item.price || 0);
    return isNaN(p) ? "" : `Rs ${p.toLocaleString("en-LK")}`;
  }, [item.price]);
  const disabled = Number(item.stock ?? 0) <= 0;

  return (
    <article className="cb-card">
      <button className="cb-thumb" onClick={() => onOpen(item)}>
        <img src={img} alt={item.name} />
        {!!(item.stock <= 5) && (
          <span className="cb-badge warn">
            {disabled ? "Out of stock" : "Low stock"}
          </span>
        )}
      </button>
      <div className="cb-body">
        <h3 className="cb-title">
          <button className="cb-title-btn" onClick={() => onOpen(item)}>
            {item.name}
          </button>
        </h3>
        {item.category && <div className="cb-chip">{item.category}</div>}
        <p className="cb-desc">{item.description || " "}</p>
      </div>
      <div className="cb-meta">
        <div className="cb-price">{price}</div>
        <div className="cb-stock">{item.stock ?? 0} in stock</div>
      </div>
      <div className="cb-actions">
        <button
          className="cb-btn ghost"
          onClick={() => onAdd(item)}
          disabled={disabled}
        >
          Add to cart
        </button>
        <button
          className="cb-btn primary"
          onClick={() => onBuy(item)}
          disabled={disabled}
        >
          Buy now
        </button>
      </div>
    </article>
  );
};

/* --------------------------------- Page --------------------------------- */
const Menu = () => {
  const navigate = useNavigate();

  // unlock template scroll locks
  useEffect(() => {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.overflow = "auto";
  }, []);

  const [categories] = useState([
    "Birthday Cakes",
    "Special Cakes",
    "Cupcakes and Others",
  ]);
  const [activeCat, setActiveCat] = useState("Birthday Cakes");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  const { items, pages, total, loading, error } = useProducts({
    category: activeCat,
    q: search,
    page,
    limit,
    isActive: true,
    sort: "-createdAt",
  });

  useEffect(() => {
    setPage(1);
  }, [activeCat, search]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    window?.alert?.(`Added "${product.name}" to cart`);
  };

  const handleOpen = (product) => {
    if (!product?._id) return;
    navigate(`/order/${product._id}`, { state: { product } });
  };
  const handleBuy = (product) => {
    if (!product?._id) return;
    navigate(`/order/${product._id}`, { state: { product } });
  };

  return (
    <div className="content-wrapper cb-wrap">
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            <h1 className="cb-hero">Cakes for all tastes</h1>
            <p className="cb-sub">
              Browse our fresh, active products by category. Use search to
              refine.
            </p>

            <div className="cb-search">
              <input
                type="text"
                placeholder="Search cakes..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && <p>Loading…</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && items.length === 0 && (
              <p>No products found in “{activeCat}”.</p>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="cb-grid">
                {items.map((item) => (
                  <MenuItem
                    key={item._id}
                    item={item}
                    onAdd={handleAdd}
                    onBuy={handleBuy}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            )}
            <Pagination page={page} pages={pages} onPage={setPage} />
            {!loading && !error && total > 0 && (
              <p className="text-muted text-right" style={{ marginTop: 10 }}>
                Showing page {page} of {pages} — {total} items
              </p>
            )}
          </div>
        </section>
      </div>
      <style>{css}</style>
    </div>
  );
};

export default Menu;

/* ------------------------------ Styles --------------------------------- */
const css = `
.cb-wrap { --pink:#ff6f61; --rose:#ffe9dc; --line:#f0d8cd; --ink:#333; --mut:#777; --chip:#b66a5e; }

.cb-hero { font-family:"Satisfy", cursive; color: var(--pink); font-size: 48px; margin: 22px 0 6px; }
.cb-sub { color:#666; margin-bottom: 18px; }
.cb-search { margin-bottom: 14px; }
.cb-search input { height: 44px; border-radius: 10px; }

/* Grid & card */
.cb-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:16px; }
.cb-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; transition:.2s; box-shadow:0 2px 10px rgba(0,0,0,.02); }
.cb-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(0,0,0,.07); }
.cb-thumb { position:relative; background:#faf6f4; width:100%; height:240px; overflow:hidden; }
.cb-thumb img { width:100%; height:100%; object-fit:cover; display:block; border-radius:12px; }
.cb-badge { position:absolute; top:10px; right:10px; background:#e67e22; color:#fff; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
.cb-body { padding:12px; }
.cb-title { margin: 0 0 6px; font-size: 24px; font-weight: 800; line-height: 1.2; color: var(--ink); }
.cb-title-btn { background:transparent; border:0; padding:0; color:inherit; font: inherit; text-align:left; cursor:pointer; }
.cb-chip { display:inline-block; border:1px solid var(--line); color:var(--chip); border-radius:999px; padding:2px 8px; font-size:11px; }
.cb-desc { color:#666; font-size:13px; margin:8px 0 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.cb-meta { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-top:1px solid #f7e4dc; }
.cb-price { font-weight:800; }
.cb-stock { font-size:12px; color:#666; }
.cb-actions { display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:12px; border-top:1px solid #f7e4dc; }
.cb-btn { border:1px solid #e7c2b3; border-radius:10px; padding:10px 12px; font-weight:700; cursor:pointer; background:#fff; color:#333; }
.cb-btn.primary { background:var(--pink); color:#fff; border-color: var(--pink); }   
.cb-btn.primary:hover { filter:brightness(.96); }
.cb-btn.ghost:hover { background:#fff6f4; }
.cb-pager { display:flex; align-items:center; gap:10px; justify-content:center; margin:18px 0 6px; }
.cb-pager-info { color:#555; }
@media (max-width: 600px) { .cb-hero { font-size: 36px; } }
`;
