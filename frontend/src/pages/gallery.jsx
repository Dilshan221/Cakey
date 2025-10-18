// src/pages/gallery.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* --- Gallery data (use /assets paths) --- */
const ITEMS = [
  { src: "/assets/img/gallery/gallery1.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery2.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery3.jpg", cat: "birthday" },
  { src: "/assets/img/gallery/gallery4.jpg", cat: "birthday" },
  { src: "/assets/img/gallery/gallery5.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery6.jpg", cat: "cupcakes" },
  { src: "/assets/img/gallery/gallery7.jpg", cat: "birthday" },
  { src: "/assets/img/gallery/gallery8.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery9.jpg", cat: "birthday" },
  { src: "/assets/img/gallery/gallery10.jpg", cat: "cupcakes" },
  { src: "/assets/img/gallery/gallery11.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery12.jpg", cat: "special" },
  { src: "/assets/img/gallery/gallery13.jpg", cat: "cupcakes" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [viewer, setViewer] = useState(null); // image src for lightbox

  const filtered =
    filter === "all" ? ITEMS : ITEMS.filter((i) => i.cat === filter);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setViewer(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="content-wrapper" id="top">
      {/* ===== Hero / breadcrumb ===== */}
      <div className="divider-top">
        <div className="header-info col-md-12">
          <div className="inside-wrapper container">
            <h1>Gallery</h1>
            <ul className="breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="active">Gallery</li>
            </ul>
          </div>
        </div>
        <div className="gradient-overlay" />
      </div>

      {/* ===== Content ===== */}
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            <h2>Our Image gallery</h2>
            <p>
              Explore our stunning collection of handcrafted cakes and pastries.
              Each creation is made with the finest ingredients and artistic
              precision. From elegant wedding cakes to fun birthday creations,
              our gallery showcases the quality and creativity that goes into
              every dessert we make.
            </p>

            {/* Filter pills */}
            <ul className="nav nav-pills cat margin1">
              {[
                { key: "all", label: "All" },
                { key: "birthday", label: "Birthday Cakes" },
                { key: "special", label: "Special Cakes" },
                { key: "cupcakes", label: "Cupcakes" },
              ].map((tab) => (
                <li
                  key={tab.key}
                  className={filter === tab.key ? "active" : ""}
                >
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setFilter(tab.key)}
                    style={{ textDecoration: "none" }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Gallery grid */}
            <div id="gallery-isotope" className="lightbox margin1 row">
              {filtered.map((g, i) => (
                <div
                  key={g.src + i}
                  className={`col-lg-4 col-sm-6 col-md-6 ${g.cat}`}
                >
                  <div className="isotope-item">
                    <div className="gallery-thumb">
                      <img
                        className="img-responsive"
                        src={g.src}
                        alt={`Gallery ${i + 1}`}
                      />
                      <button
                        type="button"
                        className="open-image"
                        onClick={() => setViewer(g.src)}
                        aria-label="Open image"
                        title="Click to view"
                      >
                        <span className="overlay-mask" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Simple lightbox */}
      {viewer && (
        <div className="rz-lightbox" onClick={() => setViewer(null)}>
          <img src={viewer} alt="Preview" />
          <button
            className="rz-close"
            onClick={() => setViewer(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Small CSS helpers for this page */}
      <style>{`
        .btn.btn-link { padding: 10px 15px; }
        .open-image {
          background: transparent; border: 0; padding: 0; margin: 0;
          position: absolute; inset: 0; width: 100%; height: 100%; cursor: zoom-in;
        }
        .gallery-thumb { position: relative; overflow: hidden; }
        .gallery-thumb .overlay-mask {
          position: absolute; inset: 0; background: rgba(0,0,0,.2);
          opacity: 0; transition: opacity .2s ease;
        }
        .gallery-thumb:hover .overlay-mask { opacity: 1; }

        /* Lightbox */
        .rz-lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,.85);
          display: grid; place-items: center; z-index: 1050;
          padding: 24px;
        }
        .rz-lightbox img { max-width: 92vw; max-height: 88vh; border-radius: 6px; }
        .rz-close {
          position: fixed; top: 16px; right: 20px; width: 40px; height: 40px;
          border-radius: 999px; border: 0; background: #fff; color: #000;
          font-size: 26px; line-height: 1; cursor: pointer;
          display: grid; place-items: center;
        }
      `}</style>
    </div>
  );
}
