
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Add a new service
export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      category,
      description,
      price,
      duration,
      image,
    } = req.body;

    if (
      !serviceName ||
      !category ||
      !description ||
      price === undefined ||
      duration === undefined ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "All service fields are required",
      });
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isFinite(Number(duration)) ||
      Number(duration) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and duration must be valid positive numbers",
      });
    }

    const db = getDB();

    const newService = {
      serviceName: serviceName.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      duration: Number(duration),
      image: image.trim(),
      status: "active",
      createdAt: new Date(),
    };

    const result = await db
      .collection("services")
      .insertOne(newService);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: {
        _id: result.insertedId,
        ...newService,
      },
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// Update an existing service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const allowedFields = [
      "serviceName",
      "category",
      "description",
      "price",
      "duration",
      "image",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (
      updates.status !== undefined &&
      !["active", "inactive"].includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }
    }

    if (updates.duration !== undefined) {
      updates.duration = Number(updates.duration);

      if (!Number.isFinite(updates.duration) || updates.duration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a positive number",
        });
      }
    }

    for (const field of [
      "serviceName",
      "category",
      "description",
      "image",
    ]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    const db = getDB();

    const result = await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const db = getDB();

    const result = await db.collection("services").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};
