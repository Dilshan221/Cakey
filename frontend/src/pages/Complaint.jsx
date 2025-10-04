import React, { useState } from "react";
import { Link } from "react-router-dom";

const ComplaintPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!phoneRegex.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateComplaintType = (type) => {
    if (!type) {
      return "Please select a complaint type";
    }
    return "";
  };

  const validateComplaint = (complaint) => {
    if (!complaint.trim()) {
      return "Complaint details are required";
    }
    if (complaint.trim().length < 20) {
      return "Please provide at least 20 characters describing your complaint";
    }
    if (complaint.trim().length > 1000) {
      return "Complaint description must not exceed 1000 characters";
    }
    return "";
  };

  const validatePhoto = (file) => {
    if (file && file.size > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      
      if (file.size > maxSize) {
        return "Photo size must not exceed 5MB";
      }
      if (!allowedTypes.includes(file.type)) {
        return "Only JPG, PNG, and GIF images are allowed";
      }
    }
    return "";
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    let error = "";

    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "complaintType":
        error = validateComplaintType(value);
        break;
      case "complaint":
        error = validateComplaint(value);
        break;
      case "photo":
        error = validatePhoto(files[0]);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle phone input to allow only numbers
  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 10) {
      e.target.value = value;
      handleInputChange(e);
    } else {
      e.preventDefault();
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const validationErrors = {
      name: validateName(data.name),
      email: validateEmail(data.email),
      phone: validatePhone(data.phone),
      complaintType: validateComplaintType(data.complaintType),
      complaint: validateComplaint(data.complaint),
      photo: validatePhoto(data.photo)
    };

    // Check if there are any errors
    const hasErrors = Object.values(validationErrors).some(error => error !== "");
    
    if (hasErrors) {
      setErrors(validationErrors);
      setMessage("Please fix the errors before submitting");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});
    
    // Add photo name if file exists  
    if (data.photo?.size > 0) {
      data.photo = data.photo.name;
    } else {
      delete data.photo;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage("Complaint submitted successfully!");
        setIsSuccess(true);
        e.target.reset();
        setErrors({});
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
                  <p>All complaints are handled instantly</p>
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
                        className={`form-control input-field ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter your full name"
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
                        placeholder="Enter your email address"
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
                    <div className="col-md-6">
                      <label>
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control input-field ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="Enter 10-digit phone number"
                        onInput={handlePhoneInput}
                        maxLength="10"
                        required
                      />
                      {errors.phone && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.phone}
                        </small>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label>
                        Complaint Type <span className="required">*</span>
                      </label>
                      <select 
                        name="complaintType" 
                        className={`form-control input-field ${errors.complaintType ? 'is-invalid' : ''}`}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select complaint type</option>
                        <option value="Product Quality">Product Quality</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Billing Problem">Billing Problem</option>
                      </select>
                      {errors.complaintType && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.complaintType}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <label>
                        Complaint Details <span className="required">*</span>
                      </label>
                      <textarea
                        name="complaint"
                        className={`textarea-field form-control ${errors.complaint ? 'is-invalid' : ''}`}
                        rows="6"
                        placeholder="Please describe your complaint in detail. Include any relevant order numbers, dates, or other information that might help us resolve your issue."
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      {errors.complaint && (
                        <small className="text-danger">
                          <i className="fa fa-exclamation-circle"></i> {errors.complaint}
                        </small>
                      )}
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
                        className={`form-control input-field ${errors.photo ? 'is-invalid' : ''}`}
                        accept="image/*"
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">
                        Upload a photo related to your complaint (JPG, PNG, GIF - Max 5MB)
                      </small>
                      {errors.photo && (
                        <div>
                          <small className="text-danger">
                            <i className="fa fa-exclamation-circle"></i> {errors.photo}
                          </small>
                        </div>
                      )}
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