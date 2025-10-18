import React, { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    // Initialize scripts when component mounts
    if (window.$) {
      // Initialize LayerSlider
      if (window.$("#slider").layerSlider) {
        window.$("#slider").layerSlider();
      }

      // Initialize carousels
      if (window.$("#owl-services").length) {
        window.$("#owl-services").owlCarousel({
          loop: true,
          margin: 10,
          nav: true,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 },
          },
        });
      }

      if (window.$("#owl-posts").length) {
        window.$("#owl-posts").owlCarousel({
          loop: true,
          margin: 10,
          nav: true,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 },
          },
        });
      }
    }
  }, []);

  return (
    <>
      {/* ===== content starts  ===== */}
      <div className="content-wrapper">
        {/* Parallax Slider */}
        <div
          id="slider"
          className="parallax-slider"
          style={{ width: "1200px", margin: "0 auto", marginBottom: "0px" }}
        >
          {/* Slide 1 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img src="/assets/img/slider/slide1.jpg" className="ls-bg" alt="" />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>
                  <span>Welcome to</span> <br />
                  Cake & Bake
                </h1>
                <p className="header-p">
                  We offer high quality, delicious,"from scratch" cakes! See our
                  menu for more information
                </p>
                <div className="hidden-small">
                  <a className="btn btn-primary" href="/menu">
                    Our Menu
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img
              src="/assets/img/slider/slide2.webp"
              className="ls-bg"
              alt=""
            />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>We offer Catering</h1>
                <p className="header-p">
                  We offer catering services for any kind of event! Contact us
                  to make an order
                </p>
                <div className="hidden-small">
                  <a className="btn btn-primary" href="/contact">
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img src="assets\img\slider\slide3.webp" className="ls-bg" alt="" />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>
                  <span>Welcome to</span> <br />
                  Cake & Bake
                </h1>
                <p className="header-p">
                  We offer high quality, delicious,"from scratch" cakes! See our
                  menu for more information
                </p>
                <div className="hidden-small">
                  <a className="btn btn-primary" href="/menu">
                    Our Menu
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img src="assets/img/slider/slide4.webp" className="ls-bg" alt="" />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>We offer Catering</h1>
                <p className="header-p">
                  We offer catering services for any kind of event! Contact us
                  to make an order
                </p>
                <div className="hidden-small">
                  <a className="btn btn-primary" href="/contact">
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* divider-home */}
        <div className="divider-top divider-home"></div>

        {/* ===== content-box starts ===== */}
        <div className="content-box container">
          <section className="inside-page">
            <div className="inside-wrapper container">
              <div className="col-md-12">
                <h2 className="text-center-sm">Made with love</h2>
                <img
                  className="img-responsive img-rounded pull-right-lg col-md-4 center-block"
                  src="assets/img/services/services-home.jpg"
                  alt=""
                />
                <p className="lead res-margin">
                  High Quality services since 2001, qui fabulas definitiones at,
                  ei nibh offendit mel. Eius comprehensam ex est.Pri ei laudem
                  invenire, has ex regione sapientem
                </p>
                <p>
                  Lorem ipsum dolor sit amet, per no malorum aliquam utroque,
                  vim legere eleifend an, malis delicatissimi vel te. Pro
                  fuisset splendide vulputate an, quo eu eripuit nominati. Sit
                  enim eius laoreet te, qui fabulas definitiones at, ei nibh
                  offendit mel. Eius comprehensam ex est.Pri ei laudem invenire,
                  has ex regione sapientem.
                </p>
              </div>

              {/* owl-carousel */}
              <div
                id="owl-services"
                className="owl-carousel owl-theme text-center res-margin"
              >
                {/* service 1 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-birthday-cake-2 circle"></i>
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

                {/* service 2 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-cake-5 circle"></i>
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

                {/* service 3 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-cake-10 circle"></i>
                    <div className="service-content">
                      <h5>Cupcakes & Sweets</h5>
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

                {/* service 4 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-cake-1 circle"></i>
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

                {/* service 5 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-cooking circle"></i>
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

                {/* service 6 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-delivery circle"></i>
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
            </div>
          </section>

          <div className="bg-light">
            <section className="inside-page">
              <div className="inside-wrapper container">
                <div className="col-md-12">
                  {/* Tabs */}
                  <ul className="nav nav-tabs">
                    <li className="active">
                      <a data-toggle="tab" href="#A">
                        Why Choose us?
                      </a>
                    </li>
                    <li>
                      <a data-toggle="tab" href="#B">
                        Our Philosophy
                      </a>
                    </li>
                    <li>
                      <a data-toggle="tab" href="#C">
                        Quality Ingredients
                      </a>
                    </li>
                  </ul>

                  <div className="tabbable">
                    <div className="tab-content">
                      <div className="tab-pane active in fade" id="A">
                        <div className="col-md-5 p-2">
                          <img
                            className="img-responsive img-rounded center-block"
                            src="/img/tab1.jpg"
                            alt=""
                          />
                        </div>
                        <h3 className="text-center-sm">Why Choose us?</h3>
                        <p>
                          Aliquam erat volutpat In id fermentum augue, ut
                          pellentesque leo. Maecenas at arcu risus. Donec
                          commodo sodales ex, scelerisque laoreet nibh hendrerit
                          id. In aliquet magna nec lobortis maximus. Etiam
                          rhoncus leo a dolor placerat, nec elementum ipsum
                          convall.
                        </p>
                        <p>
                          <strong>
                            Etiam rhoncus leo a dolor placerat, nec elementum
                            ipsum convall Maecenas at arcu risus scelerisque
                            laoree.
                          </strong>
                        </p>
                        <p>
                          Felis tiam non metus Placerat a ultricies a, posuere
                          lorem ipseut lincas psuiem t volut pat phas ellus ac
                          sodales Lorem ipsum dolor sit amet, consectetur
                          adipisicing elit uasi quidem minus id omnis a nibh
                          fusce mollis viverra elit
                        </p>
                      </div>

                      <div className="tab-pane fade" id="B">
                        <h3 className="text-center-sm">Our Philosophy</h3>
                        <div className="col-md-4 p-2 pull-right-lg">
                          <img
                            className="img-responsive img-rounded center-block"
                            src="/img/tab2.jpg"
                            alt=""
                          />
                        </div>
                        <p>
                          Aliquam erat volutpat In id fermentum augue, ut
                          pellentesque leo. Maecenas at arcu risus. Donec
                          commodo sodales ex, scelerisque laoreet nibh hendrerit
                          id. In aliquet magna nec lobortis maximus. Etiam
                          rhoncus leo a dolor placerat, nec elementum ipsum
                          convall.
                        </p>
                        <p>
                          <strong>
                            Etiam rhoncus leo a dolor placerat, nec elementum
                            ipsum convall Maecenas at arcu risus scelerisque
                            laoree.
                          </strong>
                        </p>
                        <ul className="custom pl-0">
                          <li>
                            Ipuset phas ellus ac sodales Lorem ipsum dolor
                          </li>
                          <li>
                            Curabitur blandit pretium interdum. Aliquam sit amet
                            elementum odio, vel ultrices dui. Pellentesque ac
                            odio vitae felis suscipit
                          </li>
                          <li>
                            Omnicos directe al desirabilite de un nov lingua
                            franca: On refusa continuar payar custosi
                            traductores
                          </li>
                          <li>
                            Ipuset phas ellus ac sodales Lorem ipsum dolor
                          </li>
                          <li>
                            Curabitur blandit pretium interdum. Aliquam sit amet
                            elementum odio, vel ultrices dui. Pellentesque ac
                            odio vitae felis suscipit
                          </li>
                        </ul>
                      </div>

                      <div className="tab-pane fade" href="#C">
                        <h3 className="text-center-sm">Quality Ingredients</h3>
                        <p>
                          Aliquam erat volutpat In id fermentum augue, ut
                          pellentesque leo. Maecenas at arcu risus. Donec
                          commodo sodales ex, scelerisque laoreet nibh hendrerit
                          id. In aliquet magna nec lobortis maximus. Etiam
                          rhoncus leo a dolor placerat, nec elementum ipsum
                          convall.
                        </p>
                        <p>
                          <strong>
                            Etiam rhoncus leo a dolor placerat, nec elementum
                            ipsum convall Maecenas at arcu risus scelerisque
                            laoree.
                          </strong>
                        </p>
                        <p>
                          Felis tiam non metus Placerat a ultricies a, posuere
                          lorem ipseut lincas psuiem t volut pat phas ellus ac
                          sodales Lorem ipsum dolor sit amet, consectetur
                          adipisicing elit uasi quidem minus id omnis a nibh
                          fusce mollis viverra elit
                        </p>
                        <p>
                          Felis tiam non metus Placerat a ultricies a, posuere
                          lorem ipseut lincas psuiem t volut pat phas ellus ac
                          sodales Lorem ipsum dolor sit amet, consectetur
                          adipisicing elit uasi quidem minus id omnis a nibh
                          fusce mollis imperdie tlorem ipuset campas fincas
                          interdum donec eget metus auguen unc vel mauris
                          ultricies, vest ibulum orci eget usce mollis imperdiet
                          interdum donec eget metus auguen unc vel lorem ispuet
                          Ibu lum orci eget, viverra elit liquam erat volut pat
                          phas ellus ac sodales Lorem ipsum dolor sit amet,
                          consectetur adipisicing elit uasi quidem minus id
                          omnis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="inside-page">
            <div className="inside-wrapper container">
              <h2 className="text-center-sm">Latest Blog Posts</h2>
              <div id="owl-posts" className="col-md-12 owl-carousel">
                {/* blog post 1 */}
                <div className="col-md-12 p-1">
                  <div className="post-slide box-hover">
                    <div className="post-img">
                      <a href="/blog-single">
                        <img
                          className="img-responsive"
                          src="/img/blog/blogprev1.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">13</span>
                          <span className="month">jan</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">
                          The Best pastries for easter time
                        </a>
                      </h5>
                      <ul className="post-bar">
                        <li>
                          <i className="fa fa-user"></i>
                          <a href="#">admin</a>
                        </li>
                        <li>
                          <i className="fa fa-comment"></i>
                          <a href="#">7</a>
                        </li>
                      </ul>
                      <p className="post-description">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ad magni, nesciunt obcaecati possimus...
                      </p>
                      <a className="btn btn-primary btn-md" href="/blog-single">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>

                {/* blog post 2 */}
                <div className="col-md-12 p-1">
                  <div className="post-slide box-hover">
                    <div className="post-img">
                      <a href="/blog-single">
                        <img
                          className="img-responsive"
                          src="/img/blog/blogprev2.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">07</span>
                          <span className="month">feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">Order our new Red Velvet Cake</a>
                      </h5>
                      <ul className="post-bar">
                        <li>
                          <i className="fa fa-user"></i>
                          <a href="#">admin</a>
                        </li>
                        <li>
                          <i className="fa fa-comment"></i>
                          <a href="#">7</a>
                        </li>
                      </ul>
                      <p className="post-description">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ad magni, nesciunt obcaecati possimus...
                      </p>
                      <a className="btn btn-primary btn-md" href="/blog-single">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>

                {/* blog post 3 */}
                <div className="col-md-12 p-1">
                  <div className="post-slide box-hover">
                    <div className="post-img">
                      <a href="/blog-single">
                        <img
                          className="img-responsive"
                          src="/img/blog/blogprev3.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">13</span>
                          <span className="month">feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">
                          Order your Valentines day Cake
                        </a>
                      </h5>
                      <ul className="post-bar">
                        <li>
                          <i className="fa fa-user"></i>
                          <a href="#">admin</a>
                        </li>
                        <li>
                          <i className="fa fa-comment"></i>
                          <a href="#">7</a>
                        </li>
                      </ul>
                      <p className="post-description">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ad magni, nesciunt obcaecati possimus...
                      </p>
                      <a className="btn btn-primary btn-md" href="/blog-single">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>

                {/* blog post 4 */}
                <div className="col-md-12 p-1">
                  <div className="post-slide box-hover">
                    <div className="post-img">
                      <a href="/blog-single">
                        <img
                          className="img-responsive"
                          src="/img/blog/blogprev4.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">22</span>
                          <span className="month">feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">
                          Gingerbread decoration workshop
                        </a>
                      </h5>
                      <ul className="post-bar">
                        <li>
                          <i className="fa fa-user"></i>
                          <a href="#">admin</a>
                        </li>
                        <li>
                          <i className="fa fa-comment"></i>
                          <a href="#">7</a>
                        </li>
                      </ul>
                      <p className="post-description">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ad magni, nesciunt obcaecati possimus...
                      </p>
                      <a className="btn btn-primary btn-md" href="/blog-single">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* alert box */}
              <div className="alert-bg alert alert-info col-md-12 margin1">
                <h5>Custom Orders</h5>
                <p>
                  Laoreet nibh hendrerit id. In aliquet magna nec lobortis
                  maximus. Etiam rhoncus leo a dolor placerat, nec elementum
                  ipsum convall.
                </p>
                <p>
                  Etiam rhoncus leo a dolor placerat, nec elementum ipsum
                  convall Maecenas at arcu risus scelerisque laoree.
                </p>
                <a className="btn btn-secondary" href="/contact">
                  Contact us
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
