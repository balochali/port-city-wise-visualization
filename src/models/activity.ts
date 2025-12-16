import mongoose from "mongoose";

interface IActivity extends mongoose.Document {
  user?: string; // Username or "System"
  action: string;
  details?: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: Date;
}

const ActivitySchema = new mongoose.Schema<IActivity>({
  user: {
    type: String,
    default: "System",
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
if (mongoose.models.Activity) {
  delete mongoose.models.Activity;
}

const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);
export default Activity;
