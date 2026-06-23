import { NotificationType } from "../../types/index.js";
import { db } from "../index.js";
import { notifications } from "../schema.js";

export const createNotificationEntry = async (data: NotificationType) => {
  try {
    await db.insert(notifications).values(data);
  } catch (error) {
    console.log(error);
  }
};
