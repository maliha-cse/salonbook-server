
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Get all appointments for admin
export const getAllAppointments = async (req, res) => {
  try {
    const db = getDB();

    const appointments = await db
      .collection("appointments")
      .aggregate([
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $unwind: {
            path: "$service",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            let: { customerId: "$customerId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$id", "$$customerId"],
                  },
                },
              },
              {
                $project: {
                  name: 1,
                  email: 1,
                  image: 1,
                },
              },
            ],
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
    });
  }
};

// Confirm a pending appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const db = getDB();

    const result = await db.collection("appointments").updateOne(
      {
        _id: new ObjectId(id),
        status: "pending",
        activeSlot: true,
      },
      {
        $set: {
          status: "confirmed",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Pending appointment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully.",
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm appointment.",
    });
  }
};

// Cancel a pending or confirmed appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const db = getDB();

    const result = await db.collection("appointments").updateOne(
      {
        _id: new ObjectId(id),
        status: { $in: ["pending", "confirmed"] },
        activeSlot: true,
      },
      {
        $set: {
          status: "cancelled",
          activeSlot: false,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Active appointment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
    });
  }
};
