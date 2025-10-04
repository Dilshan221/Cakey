import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/api";

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("inventory"); // inventory | pricing | stock
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  // Fetch products via apiService
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.listProducts();
      setProducts(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helpers
  const qtyOf = (p) => Number(p.quantity ?? p.stock ?? 0);
  const priceOf = (p) => Number(p.price || 0);

  const getStockStatus = (quantity) => {
    if (quantity === 0) return "out-of-stock";
    if (quantity < 5) return "low-stock";
    if (quantity < 10) return "medium-stock";
    return "good-stock";
  };
  const getStockStatusText = (quantity) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 5) return "Very Low";
    if (quantity < 10) return "Low";
    return "In Stock";
  };
  const getProductCategory = (price) => {
    if (price < 1000) return "Budget";
    if (price < 5000) return "Standard";
    return "Premium";
  };

  const stats = useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        totalValue: 0,
        totalQuantity: 0,
        averagePrice: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        highestPriceProduct: null,
        lowestPriceProduct: null,
      };
    }

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + priceOf(p) * qtyOf(p),
      0
    );
    const totalQuantity = products.reduce((sum, p) => sum + qtyOf(p), 0);
    const averagePrice = totalQuantity ? totalValue / totalQuantity : 0;

    const lowStockProducts = products.filter((p) => qtyOf(p) < 10).length;
    const outOfStockProducts = products.filter((p) => qtyOf(p) === 0).length;

    const byPriceDesc = [...products].sort((a, b) => priceOf(b) - priceOf(a));
    const highestPriceProduct = byPriceDesc[0] ?? null;
    const lowestPriceProduct = byPriceDesc[byPriceDesc.length - 1] ?? null;

    return {
      totalProducts,
      totalValue,
      totalQuantity,
      averagePrice,
      lowStockProducts,
      outOfStockProducts,
      highestPriceProduct,
      lowestPriceProduct,
    };
  }, [products]);

  // ======== Reports (UI) ========

  const InventoryReport = () => (
    <div className="report-section">
      <h3>📦 Inventory Summary</h3>
      <div className="stats-grid">
        <div className="stat-card critical">
          <h4>Total Products</h4>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h4>Total Stock Value</h4>
          <p className="stat-number">Rs. {stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Total Quantity</h4>
          <p className="stat-number">{stats.totalQuantity}</p>
        </div>
        <div className="stat-card warning">
          <h4>Low Stock Items</h4>
          <p className="stat-number">{stats.lowStockProducts}</p>
        </div>
      </div>

      <div className="detailed-table">
        <h4>Product Inventory Details</h4>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price (Rs.)</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const q = qtyOf(p);
              const pr = priceOf(p);
              return (
                <tr key={p._id || p.id}>
                  <td>{p.name}</td>
                  <td className={q < 5 ? "low-stock" : ""}>{q}</td>
                  <td>{pr.toLocaleString()}</td>
                  <td>Rs. {(pr * q).toLocaleString()}</td>
                  <td>
                    <span className={`status ${getStockStatus(q)}`}>
                      {getStockStatusText(q)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PricingReport = () => (
    <div className="report-section">
      <h3>💰 Pricing Analysis</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Average Price</h4>
          <p className="stat-number">Rs. {stats.averagePrice.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Highest Priced Item</h4>
          <p className="stat-number">
            Rs. {stats.highestPriceProduct?.price?.toLocaleString() || 0}
          </p>
          <small>{stats.highestPriceProduct?.name || "N/A"}</small>
        </div>
        <div className="stat-card">
          <h4>Lowest Priced Item</h4>
          <p className="stat-number">
            Rs. {stats.lowestPriceProduct?.price?.toLocaleString() || 0}
          </p>
          <small>{stats.lowestPriceProduct?.name || "N/A"}</small>
        </div>
        <div className="stat-card">
          <h4>Price Range</h4>
          <p className="stat-number">
            Rs. {stats.lowestPriceProduct?.price?.toLocaleString() || 0} - Rs.{" "}
            {stats.highestPriceProduct?.price?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      <div className="detailed-table">
        <h4>Product Pricing Details</h4>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price (Rs.)</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Price per Unit</th>
            </tr>
          </thead>
          <tbody>
            {[...products]
              .sort((a, b) => priceOf(b) - priceOf(a))
              .map((p) => {
                const pr = priceOf(p);
                const q = qtyOf(p);
                return (
                  <tr key={p._id || p.id}>
                    <td>{p.name}</td>
                    <td className="price-cell">{pr.toLocaleString()}</td>
                    <td>{q}</td>
                    <td>{getProductCategory(pr)}</td>
                    <td>Rs. {pr.toFixed(2)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StockReport = () => {
    const low = products.filter((p) => qtyOf(p) < 10 && qtyOf(p) > 0);
    const out = products.filter((p) => qtyOf(p) === 0);
    const ok = products.filter((p) => qtyOf(p) >= 10);

    return (
      <div className="report-section">
        <h3>⚠️ Stock Alerts</h3>

        <div className="alert-section">
          <div className="alert-critical">
            <h4>Out of Stock ({out.length})</h4>
            {out.length ? (
              <ul>
                {out.map((p) => (
                  <li key={p._id || p.id}>
                    <strong>{p.name}</strong> — Needs immediate restocking
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products are out of stock 🎉</p>
            )}
          </div>

          <div className="alert-warning">
            <h4>Low Stock ({low.length})</h4>
            {low.length ? (
              <ul>
                {low.map((p) => (
                  <li key={p._id || p.id}>
                    <strong>{p.name}</strong> — Only {qtyOf(p)} left (Reorder)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No low stock items 🎉</p>
            )}
          </div>

          <div className="alert-good">
            <h4>Healthy Stock ({ok.length})</h4>
            {ok.length ? (
              <ul>
                {ok.map((p) => (
                  <li key={p._id || p.id}>
                    <strong>{p.name}</strong> — {qtyOf(p)} in stock
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products with healthy stock levels</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ======== Print-to-PDF (no libraries) ========
  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const printContents = reportRef.current.innerHTML;

      // Collect styles so the printout matches on-screen
      const styleTags = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      const printHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cake & Bake - Product Analytics Report</title>
    ${styleTags}
    <style>
      /* Force white background and A4-friendly layout */
      @page { size: A4; margin: 12mm; }
      body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .sidebar { display: none !important; }
      .main { margin: 0 !important; }
      .report-footer { page-break-after: always; }
      /* optional: prevent tables from breaking awkwardly */
      table { page-break-inside:auto }
      tr { page-break-inside:avoid; page-break-after:auto }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
    </style>
  </head>
  <body>
    <div class="print-wrapper">
      ${printContents}
    </div>
    <script>
      window.onload = function() {
        window.focus();
        window.print();
        setTimeout(() => window.close(), 300);
      };
    </script>
  </body>
</html>`;

      const blob = new Blob([printHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Use an iframe (safer than window.open popup blockers)
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);

      // Cleanup after print window closes
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
        setIsGeneratingPDF(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsGeneratingPDF(false);
      alert("Couldn't generate the PDF. Try again.");
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin/product/dashboard">Dashboard</Link>
          <Link to="/cadmin/product/form">Products</Link>
          <Link to="/cadmin/product/reports" className="active">
            Reports
          </Link>
          <Link to="/cadmin/product/search">Search Engine</Link>
        </nav>
      </div>

      {/* Main */}
      <div className="main">
        <div className="main-container">
          <div className="header-section">
            <h1>📊 Product Analytics Report</h1>
            <p className="subtitle">
              Real-time reports based on your inventory
            </p>

            {/* Report Type Selector */}
            <div className="report-selector">
              <button
                className={`report-btn ${
                  reportType === "inventory" ? "active" : ""
                }`}
                onClick={() => setReportType("inventory")}
              >
                📦 Inventory Report
              </button>
              <button
                className={`report-btn ${
                  reportType === "pricing" ? "active" : ""
                }`}
                onClick={() => setReportType("pricing")}
              >
                💰 Pricing Report
              </button>
              <button
                className={`report-btn ${
                  reportType === "stock" ? "active" : ""
                }`}
                onClick={() => setReportType("stock")}
              >
                ⚠️ Stock Alerts
              </button>

              {/* Download PDF */}
              <button
                className="download-btn"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || loading || products.length === 0}
                title="Opens print dialog — choose 'Save as PDF'"
              >
                {isGeneratingPDF ? "🔄 Generating…" : "📄 Download PDF"}
              </button>
            </div>
          </div>

          {error && <div className="loading">Error: {error}</div>}

          {loading ? (
            <div className="loading">Loading product data...</div>
          ) : !products.length ? (
            <div className="no-data">
              <h3>No Products Found</h3>
              <p>
                There are no products in the system.{" "}
                <Link to="/cadmin/product/form">Add your first product</Link> to
                generate reports.
              </p>
            </div>
          ) : (
            <div className="report-content" ref={reportRef}>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card total">
                  <h3>Total Products</h3>
                  <p>{stats.totalProducts}</p>
                </div>
                <div className="summary-card value">
                  <h3>Total Inventory Value</h3>
                  <p>Rs. {stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="summary-card quantity">
                  <h3>Total Items in Stock</h3>
                  <p>{stats.totalQuantity}</p>
                </div>
                <div className="summary-card alerts">
                  <h3>Stock Alerts</h3>
                  <p>{stats.lowStockProducts + stats.outOfStockProducts}</p>
                </div>
              </div>

              {/* Dynamic content */}
              {reportType === "inventory" && <InventoryReport />}
              {reportType === "pricing" && <PricingReport />}
              {reportType === "stock" && <StockReport />}

              {/* Footer */}
              <div className="report-footer">
                <p>Report generated on: {new Date().toLocaleString()}</p>
                <p>Total products in system: {stats.totalProducts}</p>
                <p className="pdf-watermark">Cake & Bake Management System</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        body { margin:0; font-family: "Arial", sans-serif; background:#f8f9fa; color:#333; display:flex; }
        .linklike { background:none; border:none; padding:12px 10px; margin:5px 0; color:#0a58ca; text-align:left; cursor:pointer; display:block; border-radius:6px; }
        .linklike:hover { background:#e8f0ff; }

        .sidebar { width:250px; background:#ffe9dc; min-height:100vh; padding:20px; position:fixed; top:0; left:0; }
        .sidebar .logo { text-align:center; margin-bottom:30px; }
        .sidebar .logo h2 { font-family:"Brush Script MT", cursive; color:#e74c3c; }
        .sidebar nav a { display:block; text-decoration:none; padding:12px 10px; margin:5px 0; border-radius:6px; color:#333; transition:.3s; font-weight:500; }
        .sidebar nav a:hover, .sidebar nav a.active { background:#ff6f61; color:white; }

        .main { margin-left:250px; padding:30px; min-height:100vh; background:#f8f9fa; display:flex; justify-content:center; }
        .main-container { width:100%; max-width:1200px; }
        .header-section { margin-bottom:30px; text-align:center; }
        .header-section h1 { font-size:28px; margin:0 0 10px; color:#e74c3c; }
        .subtitle { color:#666; }

        .report-selector { display:flex; gap:15px; margin-top:20px; justify-content:center; flex-wrap:wrap; align-items:center; }
        .report-btn { padding:12px 20px; border:2px solid #ddd; background:white; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; transition:all .3s; min-width:150px; }
        .report-btn:hover { border-color:#ff6f61; }
        .report-btn.active { background:#ff6f61; color:white; border-color:#ff6f61; }

        .download-btn { padding:12px 20px; border:2px solid #27ae60; background:#27ae60; color:white; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; transition:.3s; min-width:150px; }
        .download-btn:hover:not(:disabled) { background:#219955; border-color:#219955; }
        .download-btn:disabled { background:#95a5a6; border-color:#95a5a6; cursor:not-allowed; opacity:.6; }

        .summary-cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:20px; margin-bottom:30px; }
        .summary-card { background:white; padding:25px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,.08); text-align:center; border-left:5px solid #3498db; }
        .summary-card.total { border-left-color:#3498db; }
        .summary-card.value { border-left-color:#27ae60; }
        .summary-card.quantity { border-left-color:#e67e22; }
        .summary-card.alerts { border-left-color:#e74c3c; }
        .summary-card h3 { margin:0; font-size:14px; color:#666; text-transform:uppercase; letter-spacing:.5px; }
        .summary-card p { margin:10px 0 0; font-size:28px; font-weight:bold; color:#333; }

        .report-section { text-align:center; }
        .report-section h3 { font-size:24px; color:#333; margin-bottom:20px; }

        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:15px; margin:20px 0; }
        .stat-card { background:white; padding:20px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,.1); text-align:center; }
        .stat-card.critical { border-top:4px solid #e74c3c; }
        .stat-card.warning { border-top:4px solid #f39c12; }
        .stat-number { font-size:24px; font-weight:bold; margin:10px 0 0; color:#333; }

        .detailed-table { margin-top:30px; }
        .detailed-table h4 { text-align:center; font-size:20px; color:#333; margin-bottom:15px; }
        table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,.1); margin:15px 0; }
        table thead { background:#ff6f61; color:white; }
        table th, table td { padding:12px 15px; text-align:center; border-bottom:1px solid #eee; }
        table tr:hover { background:#f9f9f9; }

        .status { padding:4px 8px; border-radius:12px; font-size:12px; font-weight:bold; }
        .status.out-of-stock { background:#ffebee; color:#c62828; }
        .status.low-stock { background:#fff3e0; color:#ef6c00; }
        .status.medium-stock { background:#e8f5e8; color:#2e7d32; }
        .status.good-stock { background:#e3f2fd; color:#1565c0; }

        .alert-section { display:flex; flex-direction:column; gap:20px; margin:20px 0; }
        .alert-critical, .alert-warning, .alert-good { padding:20px; border-radius:8px; border-left:5px solid; text-align:left; }
        .alert-critical { background:#ffebee; border-left-color:#e74c3c; }
        .alert-warning { background:#fff3e0; border-left-color:#f39c12; }
        .alert-good { background:#e8f5e8; border-left-color:#27ae60; }
        .alert-section h4 { margin:0 0 10px; color:#333; text-align:center; }

        .loading, .no-data { text-align:center; padding:40px; background:white; border-radius:10px; margin:20px 0; color:#666; }
        .report-footer { text-align:center; margin-top:30px; padding:20px; background:white; border-radius:8px; color:#666; font-size:14px; }

        @media (max-width: 768px) {
          .main { margin-left:0; padding:20px; }
          .sidebar { display:none; }
          .report-selector { flex-direction:column; align-items:center; }
          .report-btn, .download-btn { width:100%; max-width:300px; }
          .summary-cards { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
