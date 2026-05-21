import mongoose from "mongoose";

const ManufacturingPanelSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
    trim: true,
  },
  production_id: {
    type: String,
    trim: true,
  },
  panel_capacity: {
    type: String,
    required: true,
    trim: true,
  },
  panel_type: {
    type: String,
    required: true,
    trim: true,
  },
  panel_count: {
    type: Number,
    trim: true,
  },
  shift: {
    type: String,
    required: true,
    trim: true,
  },
  panel_count: {
    type: Number,
    trim: true,
  },
  date: {
    type: String,
    required: true,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  created_by: {
    type: String,
    trim: true,
  },
  updated_by: {
    type: String,
    trim: true,
  }
},
  { timestamps: true }

)

export default mongoose.model("ManufacturingPanel", ManufacturingPanelSchema)