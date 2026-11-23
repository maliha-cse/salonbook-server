
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { APPOINTMENT_TIME_SLOTS } from "../utils/appointmentSlots.js";

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { serviceId, appointmentDate, timeSlot, message = "" } = req.body;

    // Validate required fields
    if (!serviceId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Service, appointment date, and time slot are required.",
      });
    }

    if (!ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }

    // Validate appointment date
    const dateParts = appointmentDate.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!dateParts) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid appointment date.",
      });
    }

    const year = Number(dateParts[1]);
    const month = Number(dateParts[2]);
    const day = Number(dateParts[3]);

    // Create date using local timezone
    const selectedDate = new Date(year, month - 1, day);

    // Check whether the date is actually valid
    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid appointment date.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot book an appointment for a past date.",
      });
    }

    // Validate time slot
    if (!APPOINTMENT_TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid appointment time slot.",
      });
    }

    if (typeof message !== "string" || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message must be a string with at most 500 characters.",
      });
    }

    const db = getDB();

    // Verify that the service exists and is active
    const service = await db.collection("services").findOne({
      _id: new ObjectId(serviceId),
      status: "active",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "This service is unavailable or inactive.",
      });
    }

    // Create appointment with an active slot reservation
    const appointment = {
      serviceId: new ObjectId(serviceId),
      customerId: req.user.id,
      appointmentDate,
      timeSlot,
      message: message.trim(),
      servicePrice: Number(service.price),
      paymentStatus: "unpaid",
      status: "pending",
      activeSlot: true,
      createdAt: new Date(),
    };

    try {
      const result = await db.collection("appointments").insertOne(appointment);

      return res.status(201).json({
        success: true,
        message: "Appointment request submitted successfully!",
        appointment: {
          _id: result.insertedId,
          ...appointment,
        },
      });
    } catch (error) {
      // MongoDB duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "This time slot is already booked. Please choose another slot.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment.",
    });
  }
};

// Get appointments of the logged-in customer
export const getMyAppointments = async (req, res) => {
  try {
    const db = getDB();

    const appointments = await db
      .collection("appointments")
      .aggregate([
        {
          $match: {
            customerId: req.user.id,
          },
        },
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
    console.error("Get my appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
    });
  }
};

// Cancel a pending appointment owned by the logged-in customer
export const cancelMyAppointment = async (req, res) => {
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
        customerId: req.user.id,
        status: "pending",
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
        message:
          "Appointment not found, or you can only cancel your own pending appointments.",
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
