import React, { useEffect } from "react";

export default function Services() {
  useEffect(() => {
    // Initialize jQuery plugins only if available (you load them in index.html)
    const $ = window.$ || window.jQuery;

    if ($ && $.fn.owlCarousel && $("#owl-services").length) {
      $("#owl-services").owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 3 } },
      });
    }

    // Ensure the first FAQ item is open (Bootstrap collapse)
    if ($ && $("#collapse1").length) {
      $("#collapse1").addClass("in"); // for the template’s Bootstrap 3 styles
    }
  }, []);

  return (
    <div className="content-wrapper">
      {/* top divider image/overlay is usually a background via CSS; keep wrapper */}
      <div className="divider-top">
        <div className="header-info col-md-12">
          <div className="inside-wrapper container">
            <h1>Our Services</h1>
            <ul className="breadcrumb">
              <li>
                <a href="/">Home</a>
              </li>
              <li className="active">Our services</li>
            </ul>
          </div>
        </div>
        <div className="gradient-overlay" />
      </div>

      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            {/* Intro row */}
            <div className="row">
              <div className="col-md-7">
                <h2>Cakes for all occasions</h2>
                <p>
                  Bring your dream cake to life with our custom design service.
                  Share your ideas and we'll create a unique masterpiece that
                  exceeds your expectations.
                </p>
                <p>
                  Safe and timely delivery service to ensure your cake arrives
                  perfectly. We handle with care and guarantee freshness upon
                  arrival at your venue.
                </p>
              </div>
              <div className="col-md-5">
                {/* Update src to your asset path if different */}
                <img
                  className="img-responsive img-rounded center-block"
                  src="/assets/img/services/services.jpg"
                  alt="Services"
                />
              </div>
            </div>

            {/* Services carousel */}
            <div
              id="owl-services"
              className="owl-carousel owl-theme text-center res-margin"
              style={{ marginTop: 20 }}
            >
              {/* Item 1 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-birthday-cake-2 circle" />
                  <div className="service-content">
                    <h5>Birthday Cakes</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
              {/* Item 2 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-cake-5 circle" />
                  <div className="service-content">
                    <h5>Special Cakes</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
              {/* Item 3 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-cake-10 circle" />
                  <div className="service-content">
                    <h5>Cupcakes &amp; Sweets</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
              {/* Item 4 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-cake-1 circle" />
                  <div className="service-content">
                    <h5>Catering</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
              {/* Item 5 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-cooking circle" />
                  <div className="service-content">
                    <h5>Custom orders</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
              {/* Item 6 */}
              <div className="col-lg-12 p-1">
                <div className="box-hover icon p-3">
                  <i className="flaticon-delivery circle" />
                  <div className="service-content">
                    <h5>Quick Delivery</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer dictum malesuada.
                    </p>
                    <a className="btn btn-primary btn-md" href="#">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ + text row */}
            <div className="row margin1">
              <div className="col-md-5">
                <h4 className="no-margin-top">Frequently asked questions</h4>
                <p>
                  Fusce mollis imperdiet interdum donec eget metus auguen. Li
                  lingues differe solmen in li grammatica, li pronunciation e li
                  plu commun vocabules. On refusa continuar payar custosi
                  traductores.
                </p>
              </div>
              <div className="col-md-7">
                <div className="panel-group" id="accordion">
                  {/* Q1 */}
                  <div className="panel">
                    <div className="panel-heading">
                      <h6 className="panel-title">
                        <a
                          className="accordion-toggle"
                          data-toggle="collapse"
                          data-parent="#accordion"
                          href="#collapse1"
                        >
                          Do you offer vegan options?
                        </a>
                      </h6>
                    </div>
                    <div id="collapse1" className="panel-collapse collapse in">
                      <div className="panel-body">
                        <p>
                          Fusce mollis imperdiet interdum donec eget metus
                          auguen vel mauris ultricies.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Q2 */}
                  <div className="panel">
                    <div className="panel-heading">
                      <h6 className="panel-title">
                        <a
                          className="accordion-toggle collapsed"
                          data-toggle="collapse"
                          data-parent="#accordion"
                          href="#collapse2"
                        >
                          Do you offer catering services?
                        </a>
                      </h6>
                    </div>
                    <div id="collapse2" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>
                          Fusce mollis imperdiet interdum donec eget metus
                          auguen vel mauris ultricies.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Q3 */}
                  <div className="panel">
                    <div className="panel-heading">
                      <h6 className="panel-title">
                        <a
                          className="accordion-toggle collapsed"
                          data-toggle="collapse"
                          data-parent="#accordion"
                          href="#collapse3"
                        >
                          How many days in advance should I order?
                        </a>
                      </h6>
                    </div>
                    <div id="collapse3" className="panel-collapse collapse">
                      <div className="panel-body">
                        <p>
                          Fusce mollis imperdiet interdum donec eget metus
                          auguen vel mauris ultricies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /.accordion */}
              </div>
            </div>

            {/* Info alert */}
            <div className="alert-bg alert alert-info col-md-12 margin1">
              <h5>Custom Orders</h5>
              <p>
                Laoreet nibh hendrerit id. In aliquet magna nec lobortis
                maximus. Etiam rhoncus leo a dolor placerat, nec elementum ipsum
                convall.
              </p>
              <p>
                Etiam rhoncus leo a dolor placerat, nec elementum ipsum convall.
                Maecenas at arcu risus scelerisque laoree.
              </p>
              <a className="btn btn-secondary" href="/contact">
                Contact us
              </a>
            </div>

            {/* Footer block (kept minimal, no global header/footer components) */}
            <footer className="footer">
              <div className="gradient-overlay top-to-bottom" />
              <div className="inside-wrapper container">
                <div className="col-md-3 col-md-offset-3">
                  <div className="brand-footer">
                    <a href="/">
                      <img
                        src="/assets/img/logo.png"
                        alt=""
                        className="img-responsive center-block"
                      />
                    </a>
                  </div>
                </div>
                <div className="col-md-4 margin-footer text-center-sm">
                  <p>
                    <i className="fas fa-map-marker-alt margin-icon" /> Street
                    name 123 - New York
                  </p>
                  <p>
                    <i className="fas fa-phone margin-icon" /> (90) 1234 - 5678
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
                <div className="col-md-12 text-center">
                  <p className="copy">
                    Copyright 2020 - 2021 / Designed by{" "}
                    <a href="https://www.ingridkuhn.com">Ingrid Kuhn</a>
                  </p>
                </div>
              </div>
              <div className="page-scroll">
                <a href="#top" className="back-to-top">
                  <i className="fa fa-angle-up" />
                </a>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
