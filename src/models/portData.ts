import mongoose, { Schema, Document } from "mongoose";

// Interface for Agent with named container fields
export interface IAgent extends Document {
  agent: string;
  "20GP": number;
  "40HC": number;
  "20RF": number;
  "40RF": number;
  "20OT": number;
  "40OT": number;
  "20FR": number;
  "40FR": number;
  "20TK": number;
  "45HC": number;
  total: number;
}

// Interface for Port Data
export interface IPortData extends Document {
  city: string;
  agents: IAgent[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Agent Schema with all container types
const AgentSchema = new Schema<IAgent>(
  {
    agent: { type: String, required: true },
    "20GP": { type: Number, default: 0 },
    "40HC": { type: Number, default: 0 },
    "20RF": { type: Number, default: 0 },
    "40RF": { type: Number, default: 0 },
    "20OT": { type: Number, default: 0 },
    "40OT": { type: Number, default: 0 },
    "20FR": { type: Number, default: 0 },
    "40FR": { type: Number, default: 0 },
    "20TK": { type: Number, default: 0 },
    "45HC": { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
); // Disable _id for subdocuments

// Port Data Schema
const PortDataSchema = new Schema<IPortData>(
  {
    city: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Store city names in uppercase for consistency
    },
    agents: [AgentSchema],
  },
  { timestamps: true }
);

// Index for faster queries
PortDataSchema.index({ city: 1 });

export default mongoose.models.PortData ||
  mongoose.model<IPortData>("PortData", PortDataSchema);
