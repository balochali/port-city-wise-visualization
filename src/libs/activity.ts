import Activity from "@/models/activity";
import connectDB from "@/libs/mongodb";

export async function logActivity(
  action: string,
  details: string = "",
  user: string = "System",
  type: "info" | "success" | "warning" | "error" = "info"
) {
  try {
    // Ensure DB connection if not already connected (though usually called within API routes that connect)
    await connectDB();

    const activity = new Activity({
      action,
      details,
      user,
      type,
    });

    await activity.save();
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw, we don't want logging failure to break the main app flow
  }
}
