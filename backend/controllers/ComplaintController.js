import Complaint from "../models/ComplaintModel.js";

// GET /complaints
export async function getAllComplaints(req, res, next)
{
  try
  {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err)
  {
    next(err);
  }
}

// POST /complaints
export async function addComplaint(req, res, next)
{
  try
  {
    const { name, email, phone, complaintType, complaint, photo, priority } =
      req.body;

    if (!name || !email || !phone || !complaintType || !complaint)
    {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const validTypes = [
      "Product Quality",
      "Customer Service",
      "Delivery Issue",
      "Billing Problem",
    ];
    if (!validTypes.includes(complaintType))
    {
      return res.status(400).json({ message: "Invalid complaint type" });
    }

    const data = {
      name,
      email,
      phone,
      complaintType,
      complaint,
      priority: priority || "Medium",
    };
    if (photo?.trim()) data.photo = photo;

    const created = await Complaint.create(data);
    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: created,
    });
  } catch (err)
  {
    next(err);
  }
}

// GET /complaints/:id
export async function getById(req, res, next)
{
  try
  {
    const doc = await Complaint.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Complaint not found" });
    res.json({ complaint: doc });
  } catch (err)
  {
    next(err);
  }
}

// PUT /complaints/:id
export async function updateComplaint(req, res, next)
{
  try
  {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint updated successfully", complaint: updated });
  } catch (err)
  {
    next(err);
  }
}

// DELETE /complaints/:id
export async function deleteComplaint(req, res, next)
{
  try
  {
    const removed = await Complaint.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (err)
  {
    next(err);
  }
}

// PATCH /complaints/:id/status
export async function updateStatus(req, res, next)
{
  try
  {
    const { status } = req.body;
    if (!["Pending", "Solved"].includes(status))
    {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Status updated successfully", complaint: updated });
  } catch (err)
  {
    next(err);
  }
}

// GET /complaints/status/:status
export async function getByStatus(req, res, next)
{
  try
  {
    const list = await Complaint.find({ status: req.params.status }).sort({
      createdAt: -1,
    });
    res.json({ complaints: list });
  } catch (err)
  {
    next(err);
  }
}

//update admin type
export async function updateAdminType(req, res, next)
{
  try
  {
    const { adminType } = req.body;
    const validTypes = ["Finance", "Order & Delivery", "User Management", "Product"];

    if (!adminType || !validTypes.includes(adminType))
    {
      return res.status(400).json({ message: "Invalid admin type" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { adminType },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Complaint not found" });

    res.json({ message: "Admin type updated successfully", complaint: updated });
  } catch (err)
  {
    next(err);
  }
}