import Product from "../models/Productmodel.js";

// GET /api/products
export async function listProducts(req, res, next) {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      sort = "-createdAt",
      isActive,
      category,
    } = req.query;

    const find = {};
    if (q) find.$text = { $search: q };
    if (category) find.category = category;
    if (isActive !== undefined)
      find.isActive = ["true", "1", true, 1].includes(isActive);

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lm = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Product.find(find)
        .sort(sort)
        .skip((pg - 1) * lm)
        .limit(lm),
      Product.countDocuments(find),
    ]);

    res.json({
      items,
      page: pg,
      limit: lm,
      total,
      pages: Math.ceil(total / lm),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
export async function getProduct(req, res, next) {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Product not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

// POST /api/products
export async function createProduct(req, res, next) {
  try {
    const p = req.body || {};

    // Basic guards (helps UX)
    if (!p.name?.trim())
      return res.status(400).json({ error: "Name is required" });
    if (p.price == null || Number.isNaN(Number(p.price)))
      return res.status(400).json({ error: "Valid price is required" });
    if (p.stock != null && Number(p.stock) < 0)
      return res.status(400).json({ error: "Stock must be ≥ 0" });

    const doc = await Product.create({
      name: p.name,
      description: p.description,
      category: p.category,
      price: Number(p.price),
      // accept both "stock" or legacy "quantity"
      stock:
        p.stock != null
          ? Number(p.stock)
          : p.quantity != null
          ? Number(p.quantity)
          : 0,
      // accept both "imageUrl" or legacy "image"
      imageUrl: p.imageUrl ?? p.image ?? "",
      isActive: p.isActive !== undefined ? !!p.isActive : true,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res, next) {
  try {
    const p = req.body || {};
    const $set = {};

    if (p.name !== undefined) $set.name = p.name;
    if (p.description !== undefined) $set.description = p.description;
    if (p.category !== undefined) $set.category = p.category;
    if (p.price !== undefined) $set.price = Number(p.price);
    if (p.stock !== undefined) $set.stock = Number(p.stock);
    if (p.quantity !== undefined) $set.stock = Number(p.quantity); // legacy
    if (p.imageUrl !== undefined) $set.imageUrl = p.imageUrl;
    if (p.image !== undefined) $set.imageUrl = p.image; // legacy
    if (p.isActive !== undefined) $set.isActive = !!p.isActive;

    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: "Product not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res, next) {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /api/products/categories
export async function listCategories(req, res, next) {
  try {
    const cats = await Product.distinct("category", { isActive: true });
    res.json(cats.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
}
