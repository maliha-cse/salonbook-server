
import { getDB } from "../config/db.js";

export const createAppointmentIndexes = async () => {
  const db = getDB();

  await db.collection("appointments").createIndex(
    {
      appointmentDate: 1,
      timeSlot: 1,
    },
    {
      unique: true,
      partialFilterExpression: {
        activeSlot: true,
      },
      name: "unique_active_appointment_slot",
    }
  );

  console.log("Appointment indexes created successfully!");
};
