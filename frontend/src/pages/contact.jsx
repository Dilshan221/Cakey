import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const submitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage("Please select a rating");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.rating = rating;

    try {
      const response = await fetch("http://localhost:5000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage("Review submitted successfully!");
        setIsSuccess(true);
        e.target.reset();
        setRating(0);
      } else {
        setMessage("Failed to submit review");
        setIsSuccess(false);
      }
    } catch {
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="divider-top">
        <div className="header-info col-md-12">
          <div className="inside-wrapper container">
            <h1>Submit Review</h1>
            <ul className="breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="active">Review</li>
            </ul>
          </div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Page Content */}
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            <h2>We Value Your Feedback</h2>
            <p>
              Share your experience with us. Your reviews help us improve our
              products and services.
            </p>

            {/* Contact-style Info Cards */}
            <div className="row contact-boxes text-center margin1">
              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-envelope small-icon"></i>
                  <h5>Email</h5>
                  <p>
                    <a href="mailto:email@yoursite.com">cakey23@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-clock small-icon"></i>
                  <h5>Hours</h5>
                  <p>
                    Mon - Fri: 9am to 6pm <br /> Weekends open
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-map-marker small-icon"></i>
                  <h5>Location</h5>
                  <p> 123, Malabe</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-phone small-icon"></i>
                  <h5>Call us</h5>
                  <p>(+94) 756 783 677</p>
                </div>
              </div>
            </div>

            {/* Review Form + Map */}
            <div className="row margin1">
              {/* Form */}
              <div className="col-md-7">
                <h4 className="title no-margin-top">Write a Review</h4>

                {/* Message Display */}
                {message && (
                  <div
                    className={`alert ${
                      isSuccess ? "alert-success" : "alert-danger"
                    } text-center`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={submitReview}>
                  <div className="row">
                    <div className="col-md-6">
                      <label>
                        Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control input-field"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Product <span className="required">*</span>
                      </label>
                      <select
                        name="product"
                        className="form-control input-field"
                        required
                      >
                        <option value="">Select a product</option>
                        <option value="Chocolate Cake">Chocolate Cake</option>
                        <option value="Vanilla Cake">Vanilla Cake</option>
                        <option value="Red Velvet Cake">Red Velvet Cake</option>
                        <option value="Cheesecake">Cheesecake</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Rating <span className="required">*</span>
                      </label>
                      <div
                        className="stars"
                        style={{ fontSize: "24px", marginBottom: "8px" }}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa fa-star ${
                              star <= rating ? "text-warning" : "text-secondary"
                            }`}
                            style={{ cursor: "pointer", marginRight: "8px" }}
                            onClick={() => setRating(star)}
                          ></i>
                        ))}
                      </div>
                      <small>
                        {rating > 0 ? `You rated ${rating}/5` : "Click to rate"}
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Review <span className="required">*</span>
                      </label>
                      <textarea
                        name="review"
                        className="textarea-field form-control"
                        rows="4"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Map + Complaint Button */}
              <div className="col-md-5">
                <div id="map-canvas" style={{ height: "400px", width: "100%" }}>
                  <iframe
                    title="location-map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.166248418626!2d80.64925627476697!3d7.877667392144664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afca53f7358007b%3A0x6aed4ff0715f9ec1!2sDambulla%20Rock%20Arch!5e0!3m2!1sen!2slk!4v1756835890775!5m2!1sen!2slk"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                {/* Complaint Button - moved here and made more prominent */}
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => navigate("/complaints")}
                  >
                    Submit Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Review;
