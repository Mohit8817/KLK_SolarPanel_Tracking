import mongoose from "mongoose";

const PanelCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true },
  panel_capacity: { type: String, required: true },
  panel_type: { type: String, required: true },
  monthYear: { type: String, required: true }, // MMYY
  seq: { type: Number, default: 0 },
}, { timestamps: true });

// Unique per combination of prefix + capacity + type + MMYY
PanelCounterSchema.index(
  { prefix: 1, panel_capacity: 1, panel_type: 1, monthYear: 1 },
  { unique: true }
);

export default mongoose.model("PanelCounter", PanelCounterSchema);
