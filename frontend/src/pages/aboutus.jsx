// src/pages/aboutus.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ---- tiny number counter (no jQuery) ---- */
function StatCounter({ end = 0, duration = 1000 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [end, duration]);
  return <div className="counter-value">{val}</div>; // avoid "++100"
}

/* ---- team data (update paths to your files) ---- */
const TEAM = [
  {
    img: "/assets/img/team/team1.jpg",
    name: "Mary Smith",
    role: "Cake Expert",
  },
  { img: "/assets/img/team/team2.jpg", name: "John Doe", role: "Baker" },
  {
    img: "/assets/img/team/team3.jpg",
    name: "Alissa Silva",
    role: "Wedding Cake Expert",
  },
  {
    img: "/assets/img/team/team4.jpg",
    name: "Ana Doe",
    role: "Cake Assistant",
  },
];

/* ---- responsive per-view helper ---- */
function usePerView() {
  const [vw, setVw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  useEffect(() => {
    const onR = () => setVw(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  if (vw >= 1200) return 3;
  if (vw >= 768) return 2;
  return 1;
}
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/* ---- simple React carousel (no libs) ---- */
function TeamCarousel({ members }) {
  const perView = usePerView();
  const slides = useMemo(() => chunk(members, perView), [members, perView]);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [perView]);

  const prev = () => setIdx((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === slides.length - 1 ? 0 : i + 1));

  return (
    <div className="team-slider">
      <button className="team-nav prev" onClick={prev} aria-label="Previous">
        ‹
      </button>

      <div className="team-viewport">
        <div
          className="team-track"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(100 / slides.length) * idx}%)`,
          }}
        >
          {slides.map((group, i) => (
            <div
              className="team-slide"
              key={i}
              style={{ width: `${100 / slides.length}%` }}
            >
              <div
                className="team-grid"
                style={{ gridTemplateColumns: `repeat(${perView}, 1fr)` }}
              >
                {group.map((m) => (
                  <article className="team-card" key={m.name}>
                    <img className="team-pic" src={m.img} alt={m.name} />
                    <div className="team-social">
                      <a href="#">
                        <i className="fa fa-envelope" />
                      </a>
                      <a href="#">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a href="#">
                        <i className="fab fa-instagram" />
                      </a>
                    </div>
                    <h4 className="team-name">{m.name}</h4>
                    <h6 className="team-role">{m.role}</h6>
                    <p className="team-bio">
                      Accusamus necessitatibus modi adipisci officia libero
                      accusantium esse hic, obcaecati, ullam, laboriosa
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="team-nav next" onClick={next} aria-label="Next">
        ›
      </button>

      <div className="team-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <div className="content-wrapper" id="top">
      {/* Hero / breadcrumb */}
      <div className="divider-top">
        <div className="header-info">
          <div className="inside-wrapper container">
            <h1>About Us</h1>
            <ul className="breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="active">About Us</li>
            </ul>
          </div>
        </div>
        <div className="gradient-overlay" />
      </div>

      {/* Content */}
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            {/* Intro */}
            <div className="row">
              <div className="col-md-5">
                <img
                  className="img-responsive img-rounded center-block"
                  src="assets/img/about/about1.jpg" // place file under public/img/about/about1.jpg
                  alt="About Cake & Bake"
                />
              </div>
              <div className="col-md-7 res-margin">
                <h2>Quality cakes and pastries</h2>
                <p>
                  <strong>
                    Li Europan lingues es membres del sam familie. Lor separat
                    existentie es un myth. Por scientie.
                  </strong>
                </p>
                <p>
                  In aliquet magna nec lobortis maximus. Li lingues differe
                  solmen in li grammatica, li pronunciation e li plu commun
                  vocabules. Etiam rhoncus leo a dolor placerat, nec elementum
                  ipsum convall.
                </p>
                <ul className="custom pl-0">
                  <li>Ipuset phas ellus ac sodales Lorem ipsum dolor</li>
                  <li>Curabitur blandit pretium interdum…</li>
                  <li>Ipuset phas ellus ac sodales Lorem ipsum dolor</li>
                </ul>
              </div>
            </div>

            {/* Counters */}
            <div id="counter" className="row margin1">
              <div className="col-md-4">
                <div className="box-hover icon counter p-2">
                  <div className="counter-wrapper">
                    <i className="counter-icon flaticon-social-care" />
                    <StatCounter end={100} />
                    <h4 className="title">Happy Customers</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-4 res-margin">
                <div className="box-hover icon counter p-2">
                  <div className="counter-wrapper">
                    <i className="counter-icon flaticon-cake-7" />
                    <StatCounter end={25} />
                    <h4 className="title">Cake Options</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-4 res-margin">
                <div className="box-hover icon counter p-2">
                  <div className="counter-wrapper">
                    <i className="counter-icon flaticon-delivery" />
                    <StatCounter end={60} />
                    <h4 className="title">Deliveries Made</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Team – carousel */}
            <div className="row margin1">
              <div className="col-md-12">
                <h3 className="title">Meet Our Team</h3>
                <TeamCarousel members={TEAM} />
              </div>
            </div>

            {/* Testimonials (kept simple) */}
            <div className="row margin1">
              <div className="col-md-12">
                <h3 className="col-md-12 title">What our clients say</h3>
                <div className="row">
                  {[
                    {
                      img: "/assets/img/about/testimonial1.jpg",
                      name: "Lucianna Smith",
                      role: "Teacher",
                    },
                    {
                      img: "/assets/img/about/testimonial2.jpg",
                      name: "John Sadana",
                      role: "Doctor",
                    },
                    {
                      img: "/assets/img/about/testimonial3.jpg",
                      name: "Jane Janeth",
                      role: "Librarian",
                    },
                  ].map((t) => (
                    <div key={t.name} className="col-sm-6 col-md-4">
                      <div className="testimonial box-hover">
                        <div className="content">
                          <p className="description">
                            Aliquam erat volutpat In id fermentum augue…
                          </p>
                        </div>
                        <div className="testimonial-pic">
                          <img src={t.img} className="img-fluid" alt={t.name} />
                        </div>
                        <div className="testimonial-review">
                          <h6 className="testimonial-title">{t.name}</h6>
                          <span>{t.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer (rows + clearfix + overlay behind content) */}
      <footer className="footer">
        <div className="gradient-overlay top-to-bottom" />
        <div className="inside-wrapper container">
          {/* row 1 */}
          <div className="row">
            <div className="col-md-3 col-md-offset-3">
              <div className="brand-footer">
                <Link to="/">
                  <img
                    src="/assets/img/logo.png" // or /img/logo.png (make sure file exists)
                    alt="Cake & Bake"
                    className="img-responsive center-block"
                  />
                </Link>
              </div>
            </div>
            <div className="col-md-4 margin-footer text-center-sm">
              <p>
                <i className="fas fa-map-marker-alt margin-icon" /> Street name
                123 - New York
              </p>
              <p>
                <i className="fas fa-phone margin-icon" /> (90) 1234 -5678
              </p>
              <p>
                <i className="far fa-clock margin-icon" /> Mon-Sat: 9am-5pm
              </p>
              <div className="social-media">
                <a href="#">
                  <i className="fas fa-envelope" />
                </a>
                <a href="#">
                  <i className="fab fa-twitter" />
                </a>
                <a href="#">
                  <i className="fab fa-facebook" />
                </a>
                <a href="#">
                  <i className="fab fa-instagram" />
                </a>
              </div>
            </div>
          </div>
          {/* row 2 */}
          <div className="row">
            <div className="col-md-12 text-center">
              <p className="copy">
                Copyright 2020 - 2021 / Designed by{" "}
                <a href="https://www.ingridkuhn.com">Ingrid Kuhn</a>
              </p>
            </div>
          </div>
        </div>

        <div className="page-scroll">
          <a href="#top" className="back-to-top">
            <i className="fa fa-angle-up" />
          </a>
        </div>
      </footer>

      {/* local CSS to ensure footer renders + carousel styles */}
      <style>{`
        /* footer fixes */
        .footer { position: relative; padding: 40px 0; }
        .footer .inside-wrapper { position: relative; z-index: 1; }
        .footer .inside-wrapper::after { content: ""; display: block; clear: both; }
        .footer .gradient-overlay { position: absolute; inset: 0; z-index: 0; }
        /* team carousel */
        .team-slider { position: relative; margin-top: 24px; }
        .team-viewport { overflow: hidden; }
        .team-track { display: flex; transition: transform .5s ease; }
        .team-slide { flex: 0 0 auto; padding: 0 8px; }
        .team-grid { display: grid; gap: 40px; }
        .team-card { text-align: center; }
        .team-pic {
          width: 260px; height: 260px; max-width: 100%;
          border-radius: 50%; object-fit: cover;
          border: 8px solid #e61e5a; margin: 0 auto 14px;
        }
        .team-social { display: flex; justify-content: center; gap: 12px; margin-bottom: 12px; }
        .team-social a { width: 36px; height: 36px; display: grid; place-items: center;
          border-radius: 999px; background: #f9a8d4; color: #fff; }
        .team-name { color: #e61e5a; font-weight: 700; margin: 4px 0 2px; }
        .team-role { margin: 0 0 10px; color: #555; }
        .team-bio { color: #666; }
        .team-nav {
          position: absolute; top: 45%; transform: translateY(-50%);
          width: 42px; height: 42px; border-radius: 999px; border: 0;
          background: #f59e0b; color: #fff; font-size: 28px; line-height: 1; cursor: pointer;
          display: grid; place-items: center; z-index: 2;
        }
        .team-nav.prev { left: -8px; }
        .team-nav.next { right: -8px; }
        .team-dots { display: flex; justify-content: center; gap: 10px; margin-top: 14px; }
        .team-dots .dot { width: 10px; height: 10px; border-radius: 999px; background: #e5e7eb; border: 0; }
        .team-dots .dot.active { background: #f59e0b; }
        @media (max-width: 1199px) { .team-pic { width: 230px; height: 230px; } }
        @media (max-width: 767px) {
          .team-pic { width: 220px; height: 220px; }
          .team-nav.prev { left: 4px; }
          .team-nav.next { right: 4px; }
        }
      `}</style>
    </div>
  );
}
