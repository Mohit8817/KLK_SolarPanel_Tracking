import mongoose from "mongoose";

const PanelCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true },
  panel_capacity: { type: String, required: true },
  panel_type: { type: String, required: true },
  year: { type: String, required: true },
  seq: { type: Number, default: 0 },
  last_lot_id: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

// Unique per combination of prefix + capacity + type + MMYY
PanelCounterSchema.index(
  { prefix: 1, panel_capacity: 1, panel_type: 1, year: 1 },
  { unique: true }
);

export default mongoose.model("PanelCounter", PanelCounterSchema);
