// routes/reviewRoutes.js
import express from "express";
import {
  getAllReviews,
  addReview,
  getById,
  updateReview,
  deleteReview,
  getReviewsByProduct,
  updateStatus,
} from "../controllers/ReviewController.js";

const router = express.Router();

router.get("/", getAllReviews); // GET  /reviews        -> []
router.post("/", addReview); // POST /reviews
router.get("/:id", getById); // GET  /reviews/:id    -> {}
router.patch("/:id", updateReview); // PATCH /reviews/:id
router.delete("/:id", deleteReview); // DELETE /reviews/:id
router.get("/product/:product", getReviewsByProduct); // GET /reviews/product/:product -> []
router.patch("/:id/status", updateStatus); // PATCH /reviews/:id/status

export default router;
