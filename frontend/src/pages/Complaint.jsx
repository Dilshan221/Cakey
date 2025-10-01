import React, { useState } from "react";
import { Link } from "react-router-dom";

const ComplaintPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const submitComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add photo name if file exists
    if (data.photo?.size > 0) {
      data.photo = data.photo.name;
    } else {
      delete data.photo;
    }
    
    try {
      const response = await fetch('http://localhost:5000/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage("Complaint submitted successfully!");
        setIsSuccess(true);
        e.target.reset();
      } else {
        setMessage("Failed to submit complaint");
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
            <h1>Submit Complaint</h1>
            <ul className="breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="active">Complaint</li>
            </ul>
          </div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Page Content */}
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container">
            <h2>We Take Your Concerns Seriously</h2>
            <p>
              Please provide detailed information about your complaint. We will 
              investigate and respond to your concern as quickly as possible.
            </p>

            {/* Contact-style Info Cards */}
            <div className="row contact-boxes text-center margin1">
              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-envelope small-icon"></i>
                  <h5>Email</h5>
                  <p>
                    <a href="mailto:complaints@yoursite.com">cakey23@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-clock small-icon"></i>
                  <h5>Response Time</h5>
                  <p>
                    Mon - Fri: 9am to 6pm <br /> Weekends open
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="box-hover icon p-2">
                  <i className="fa fa-exclamation-triangle small-icon"></i>
                  <h5>Priority</h5>
                  <p>All complaints are handled instatnly</p>
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

            {/* Complaint Form */}
            <div className="row margin1">
              <div className="col-md-8 col-md-offset-2">
                <h4 className="title no-margin-top text-center">File Your Complaint</h4>
                
                {/* Message Display */}
                {message && (
                  <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} text-center`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={submitComplaint}>
                  <div className="row">
                    <div className="col-md-6">
                      <label>
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control input-field"
                        placeholder="Enter your full name"
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
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <label>
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control input-field"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label>
                        Complaint Type <span className="required">*</span>
                      </label>
                      <select name="complaintType" className="form-control input-field" required>
                        <option value="">Select complaint type</option>
                        <option value="Product Quality">Product Quality</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Billing Problem">Billing Problem</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Complaint Details <span className="required">*</span>
                      </label>
                      <textarea
                        name="complaint"
                        className="textarea-field form-control"
                        rows="6"
                        placeholder="Please describe your complaint in detail. Include any relevant order numbers, dates, or other information that might help us resolve your issue."
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Attach Photo (Optional)
                      </label>
                      <input
                        type="file"
                        name="photo"
                        className="form-control input-field"
                        accept="image/*"
                      />
                      <small className="text-muted">
                        Upload a photo related to your complaint (JPG, PNG, GIF - Max 5MB)
                      </small>
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <button type="submit" className="btn btn-danger btn-lg" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Complaint"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintPage;