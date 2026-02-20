import mongoose from "mongoose";

const PanelSerialLotSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: true,
      trim: true,
    },
    starting_no: {
      type: Number,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    panel_capacity: {
      type: String, // 550W
      required: true,
      trim: true,
    },
    panel_type: {
      type: String, // Mono / Poly
      required: true,
      trim: true,
    },
    total_panels: {
      type: Number,
      required: true,
    },
    created_by: {
      type: String,
      trim: true,
    },
    updated_by: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PanelSerialLot", PanelSerialLotSchema);
