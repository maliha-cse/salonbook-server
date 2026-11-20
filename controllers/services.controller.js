
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Get all active services with search, category filter and price sorting
export const getServices = async (req, res) => {
  try {
    const db = getDB();

    const { search, category, sort } = req.query;

    const filter = {
      status: "active",
    };

    if (search) {
      filter.serviceName = {
        $regex: search,
        $options: "i",
      };
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    }

    const services = await db
      .collection("services")
      .find(filter)
      .sort(sortOption)
      .toArray();

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// Get a single active service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const db = getDB();

    const service = await db.collection("services").findOne({
      _id: new ObjectId(id),
      status: "active",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch service details",
    });
  }
};
