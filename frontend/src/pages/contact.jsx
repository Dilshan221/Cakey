import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReviewsAPI } from "../services/api";

const Contact = () => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should only contain letters and spaces";
    }
    if (name.trim().length < 3) {
      return "Name must be at least 3 characters long";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateProduct = (product) => {
    if (!product) {
      return "Please select a product";
    }
    return "";
  };

  const validateRating = (rating) => {
    if (rating === 0) {
      return "Please select a rating";
    }
    return "";
  };

  const validateReview = (review) => {
    if (!review.trim()) {
      return "Review is required";
    }
    if (review.trim().length < 10) {
      return "Review must be at least 10 characters long";
    }
    if (review.trim().length > 500) {
      return "Review must not exceed 500 characters";
    }
    return "";
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "product":
        error = validateProduct(value);
        break;
      case "review":
        error = validateReview(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle rating change with validation
  const handleRatingChange = (star) => {
    setRating(star);
    const error = validateRating(star);
    setErrors(prev => ({
      ...prev,
      rating: error
    }));
    console.log("⭐ Rating set to:", star);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    console.log("🔍 Submit button clicked!");
    console.log("Current rating:", rating);

    // Collect form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate all fields before submission
    const validationErrors = {
      name: validateName(data.name),
      email: validateEmail(data.email),
      product: validateProduct(data.product),
      rating: validateRating(rating),
      review: validateReview(data.review)
    };

    // Check if there are any errors
    const hasErrors = Object.values(validationErrors).some(error => error !== "");
    
    if (hasErrors) {
      setErrors(validationErrors);
      setMessage("⚠️ Please fix all validation errors before submitting");
      setIsSuccess(false);
      return;
    }

    // Set loading state
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      // Add rating to data
      data.rating = rating;

      console.log("📤 Submitting review data:", data);

      // Call API
      const response = await ReviewsAPI.create(data);
      
      console.log("✅ API Response:", response);

      // Show success message
      setMessage("✨ Review submitted successfully! Thank you for your feedback.");
      setIsSuccess(true);
      
      // Reset form
      e.target.reset();
      setRating(0);

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);

    } catch (err) {
      console.error("❌ Error submitting review:", err);
      
      const errorMsg = err?.response?.data?.message || 
                      err?.data?.message || 
                      err?.message || 
                      "Network error. Please try again.";
      
      setMessage(errorMsg);
      setIsSuccess(false);
    } finally {
      setLoading(false);
      console.log("🏁 Submit process completed");
    }
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
                    <a href="mailto:cakey23@gmail.com">cakey23@gmail.com</a>
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
                  <p>123, Malabe</p>
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
                    role="alert"
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
                        className={`form-control input-field ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter your name"
                        onChange={handleInputChange}
                        required
                      />
                      {errors.name && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.name}
                        </small>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control input-field ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="your.email@example.com"
                        onChange={handleInputChange}
                        required
                      />
                      {errors.email && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.email}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Product <span className="required">*</span>
                      </label>
                      <select
                        name="product"
                        className={`form-control input-field ${errors.product ? 'is-invalid' : ''}`}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a product</option>
                        <option value="Chocolate Cake">Chocolate Cake</option>
                        <option value="Vanilla Cake">Vanilla Cake</option>
                        <option value="Red Velvet Cake">Red Velvet Cake</option>
                        <option value="Cheesecake">Cheesecake</option>
                      </select>
                      {errors.product && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.product}
                        </small>
                      )}
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
                            onClick={() => handleRatingChange(star)}
                          ></i>
                        ))}
                      </div>
                      <small>
                        {rating > 0 ? `You rated ${rating}/5 ⭐` : "Click to rate"}
                      </small>
                      {errors.rating && (
                        <div>
                          <small className="text-danger">
                            <i className="fa fa-exclamation-circle"></i> {errors.rating}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Review <span className="required">*</span>
                      </label>
                      <textarea
                        name="review"
                        className={`textarea-field form-control ${errors.review ? 'is-invalid' : ''}`}
                        rows="4"
                        placeholder="Share your experience with us... (10-500 characters)"
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors.review && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.review}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      style={{
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
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
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => navigate("/complaints")}
                  >
                    Submit  a Complaint
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

export default Contact;