import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { authStorage } from "../utils/authStorage";

const Home = () =>
{
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    isAuthed: false,
  });

  // ---- Read token/user and attach to apiService on mount ----
  useEffect(() =>
  {
    try
    {
      const token = authStorage.read(authStorage.TOKEN_KEY);
      const userJson = authStorage.read(authStorage.USER_KEY);
      const user = userJson ? JSON.parse(userJson) : null;

      if (token)
      {
        if (typeof apiService.setAuthToken === "function")
        {
          apiService.setAuthToken(token);
        } else if (apiService?.defaults?.headers)
        {
          apiService.defaults.headers.common =
            apiService.defaults.headers.common || {};
          apiService.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
        } else
        {
          window.__CB_AUTH_TOKEN__ = token;
        }
      }

      setAuth({ token, user, isAuthed: !!token });
    } catch
    {
      setAuth({ token: null, user: null, isAuthed: false });
    }
  }, []);

  // ---- jQuery plugins init (LayerSlider, Owl Carousel) ----
  useEffect(() =>
  {
    if (window.$)
    {
      if (window.$("#slider").layerSlider)
      {
        window.$("#slider").layerSlider();
      }
      if (window.$("#owl-services").length)
      {
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
      if (window.$("#owl-posts").length)
      {
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

  // ---- Logout ----
  const handleLogout = () =>
  {
    authStorage.removeAll();

    if (apiService?.defaults?.headers?.common?.Authorization)
    {
      delete apiService.defaults.headers.common.Authorization;
    }

    navigate("/", { replace: true });

    // Reload the page after a short delay to ensure redirect is done
    setTimeout(() =>
    {
      window.location.reload();
    }, 100);
  };

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
                  From classic sponges to custom celebration cakes, everything
                  is baked fresh daily with real butter, farm eggs, and premium
                  chocolate. Browse the menu and treat yourself.
                </p>

                <div
                  className="hidden-small"
                  style={{ display: "flex", gap: 12 }}
                >
                  <Link className="btn btn-primary" to="/menu">
                    Our Menu
                  </Link>

                  {!auth.isAuthed ? (
                    <>
                      <Link className="btn btn-default" to="/login">
                        Log In
                      </Link>
                      <Link className="btn btn-secondary" to="/signup">
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link className="btn btn-default" to="/myorders">
                        My Orders
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleLogout}
                      >
                        Logout{auth?.user?.name ? ` (${auth.user.name})` : ""}
                      </button>
                    </>
                  )}
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
                  Parties, office events, and weddings—our catering team handles
                  it all with beautifully presented desserts and on-time
                  delivery.
                </p>
                <div
                  className="hidden-small"
                  style={{ display: "flex", gap: 12 }}
                >
                  <Link className="btn btn-primary" to="/contact">
                    Contact us
                  </Link>
                  {auth.isAuthed ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link className="btn btn-default" to="/login">
                      Log In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img
              src="/assets/img/slider/slide3.webp"
              className="ls-bg"
              alt=""
            />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>
                  <span>Freshly Baked</span> <br />
                  Every Single Day
                </h1>
                <p className="header-p">
                  Small batches, careful recipes, and friendly service—taste the
                  difference in every slice.
                </p>
                <div
                  className="hidden-small"
                  style={{ display: "flex", gap: 12 }}
                >
                  <Link className="btn btn-primary" to="/menu">
                    Our Menu
                  </Link>
                  {auth.isAuthed ? (
                    <Link className="btn btn-default" to="/order">
                      My Orders
                    </Link>
                  ) : (
                    <Link className="btn btn-default" to="/signup">
                      Sign Up
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4 */}
          <div
            className="ls-slide"
            data-ls="duration:6000; transition2d:7; kenburnszoom:out; kenburnsscale:1.2;"
          >
            <img
              src="/assets/img/slider/slide4.webp"
              className="ls-bg"
              alt=""
            />
            <div
              className="ls-l header-wrapper"
              data-ls="offsetyin:150; durationin:700; delayin:200; easingin:easeOutQuint; rotatexin:20; scalexin:1.4; offsetyout:600; durationout:400;"
            >
              <div className="header-text">
                <h1>Custom Cakes Made Easy</h1>
                <p className="header-p">
                  Pick your size, flavor, and design. We’ll bake, decorate, and
                  deliver right on schedule.
                </p>
                <div
                  className="hidden-small"
                  style={{ display: "flex", gap: 12 }}
                >
                  <Link className="btn btn-primary" to="/contact">
                    Contact us
                  </Link>
                  {auth.isAuthed ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link className="btn btn-default" to="/login">
                      Log In
                    </Link>
                  )}
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
                  src="/assets/img/services/services-home.jpg"
                  alt=""
                />
                <p className="lead res-margin">
                  Since 2001, Cake & Bake has been the neighborhood spot for
                  unforgettable cakes, cupcakes, and pastries. We use
                  time-tested recipes, quality ingredients, and a lot of heart.
                </p>
                <p>
                  Whether you’re celebrating a birthday, hosting an event, or
                  craving a sweet break, our team will help you choose the
                  perfect treat. Order online, schedule a pickup, or get fast
                  delivery to your door.
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
                        From fun themes to elegant finishes, our birthday cakes
                        are baked to order and tailored to your celebration.
                      </p>
                      <Link
                        className="btn btn-primary btn-md"
                        to="/menu#birthday"
                      >
                        Read More
                      </Link>
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
                        Engagements, anniversaries, corporate events—choose your
                        flavor, filling, and finish for a one-of-a-kind cake.
                      </p>
                      <Link
                        className="btn btn-primary btn-md"
                        to="/menu#special"
                      >
                        Read More
                      </Link>
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
                        Mix-and-match boxes, brownies, cookies, and more—perfect
                        for sharing or treating yourself.
                      </p>
                      <Link
                        className="btn btn-primary btn-md"
                        to="/menu#cupcakes"
                      >
                        Read More
                      </Link>
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
                        Dessert tables, mini-treat platters, and custom sets
                        with labels—designed to impress your guests.
                      </p>
                      <Link className="btn btn-primary btn-md" to="/contact">
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>

                {/* service 5 */}
                <div className="col-lg-12 p-1">
                  <div className="box-hover icon p-3">
                    <i className="flaticon-cooking circle"></i>
                    <div className="service-content">
                      <h5>Custom Orders</h5>
                      <p>
                        Share your idea or photo and we’ll bring it to life with
                        handcrafted details and precise flavors.
                      </p>
                      <Link className="btn btn-primary btn-md" to="/contact">
                        Read More
                      </Link>
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
                        Same-day options in selected areas and reliable
                        scheduled delivery for birthdays and events.
                      </p>
                      <Link className="btn btn-primary btn-md" to="/order">
                        Read More
                      </Link>
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
                            src="/assets/img/tab1.jpg"
                            alt=""
                          />
                        </div>
                        <h3 className="text-center-sm">Why Choose us?</h3>
                        <p>
                          Friendly service, fair prices, and consistent quality.
                          Our decorators and bakers collaborate with you to make
                          sure the cake you imagine is the cake you receive.
                        </p>
                        <p>
                          <strong>
                            Guaranteed freshness—every cake is baked to order
                            and never frozen.
                          </strong>
                        </p>
                        <p>
                          Order online in minutes or visit us in-store to sample
                          flavors and discuss designs with our team.
                        </p>
                      </div>

                      <div className="tab-pane fade" id="B">
                        <h3 className="text-center-sm">Our Philosophy</h3>
                        <div className="col-md-4 p-2 pull-right-lg">
                          <img
                            className="img-responsive img-rounded center-block"
                            src="/assets/img/tab2.jpg"
                            alt=""
                          />
                        </div>
                        <p>
                          Baking is a craft. We respect classic techniques while
                          exploring new tastes and textures that our customers
                          love.
                        </p>
                        <p>
                          <strong>
                            Community first—we support local suppliers and
                            celebrate our customers’ milestones.
                          </strong>
                        </p>
                        <ul className="custom pl-0">
                          <li>Made fresh daily in small batches</li>
                          <li>Thoughtful, reusable and recyclable packaging</li>
                          <li>Seasonal menus inspired by local produce</li>
                          <li>Clear communication and on-time delivery</li>
                          <li>Happiness guarantee on every order</li>
                        </ul>
                      </div>

                      {/* Fixed: use id instead of href on the pane */}
                      <div className="tab-pane fade" id="C">
                        <h3 className="text-center-sm">Quality Ingredients</h3>
                        <p>
                          We bake with real butter, premium cocoa, Madagascar
                          vanilla, and ripe fruits. No shortcuts, no
                          compromises.
                        </p>
                        <p>
                          <strong>
                            Allergies? Ask about our egg-free, dairy-free, and
                            nut-aware options.
                          </strong>
                        </p>
                        <p>
                          From sponge to frosting, every component is prepared
                          in house for balanced flavor and perfect texture.
                        </p>
                        <p>
                          We partner with trusted local suppliers to ensure
                          freshness and traceability from farm to bakery.
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
                          src="/assets/img/blog/blogprev1.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">13</span>
                          <span className="month">Jan</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">
                          Our Most-Loved Cakes of the Season
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
                        A round-up of customer favorites, from Chocolate Fudge
                        to Passionfruit Cheesecake—plus pairing tips.
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
                          src="/assets/img/blog/blogprev2.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">07</span>
                          <span className="month">Feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">Say Hello to Our Red Velvet</a>
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
                        Cream-cheese frosting, a tender crumb, and just the
                        right cocoa—here’s what makes ours special.
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
                          src="/assets/img/blog/blogprev3.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">13</span>
                          <span className="month">Feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">Valentine’s Day Pre-Orders</a>
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
                        Limited-edition heart cakes and cupcake sets. Order now
                        to secure your delivery window.
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
                          src="/assets/img/blog/blogprev4.jpg"
                          alt=""
                        />
                        <div className="post-date">
                          <span className="date">22</span>
                          <span className="month">Feb</span>
                        </div>
                      </a>
                    </div>
                    <div className="post-review">
                      <h5 className="post-title">
                        <a href="/blog-single">
                          Gingerbread Decorating Workshop
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
                        Join our pastry team for a hands-on class. All tools and
                        treats provided—just bring your creativity!
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
                  Need a cake that tells your story? Share your theme, colors,
                  and serving size—we’ll design a sketch and quote within 24
                  hours.
                </p>
                <p>
                  Rush orders available on request. Speak with our decorators
                  for guidance on flavors, fillings, and finishes.
                </p>
                <Link className="btn btn-secondary" to="/custom-order">
                  Contact us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
