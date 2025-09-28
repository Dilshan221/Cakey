// controllers/reviewController.js
import Review from "../models/ReviewModel.js";

// GET /reviews  -> return an ARRAY
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.json(reviews); // ✅ array only, send once
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews" });
  }
};

// POST /reviews
export const addReview = async (req, res) => {
  const { name, email, product, rating, review } = req.body;

  if (!name || !email || !product || !rating || !review) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const newReview = new Review({ name, email, product, rating, review });
    await newReview.save();
    return res
      .status(201)
      .json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    return res.status(500).json({ message: "Error adding review" });
  }
};

// GET /reviews/:id  -> return a SINGLE object
export const getById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json(review); // ✅ single doc
  } catch (error) {
    return res.status(500).json({ message: "Error fetching review" });
  }
};

// PATCH /reviews/:id
export const updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReview)
      return res.status(404).json({ message: "Review not found" });

    return res.json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating review" });
  }
};

// DELETE /reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting review" });
  }
};

// GET /reviews/product/:product  -> return an ARRAY
export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.product }).sort({
      createdAt: -1,
    });
    return res.json(reviews); // ✅ array
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews" });
  }
};

// PATCH /reviews/:id/status
export const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!["Pending", "Solved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json({ message: "Status updated successfully", review });
  } catch (error) {
    return res.status(500).json({ message: "Error updating status" });
  }
};
