import mongoose from "mongoose";

const ProductionPanelSchema = new mongoose.Schema({
    company_id: {
      type: String,
      required: true,
      trim: true,
    },
    panel_capacity: {
      type: String,
      required: true,
      trim: true,
    },
    panel_count: {
      type: Number,
      trim: true,
    },
    panel_type: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    accepted_by: {
      type: String,
      trim: true,
    },
    accepted_date: {
      type: String,
      trim: true,
    },
    download_status: {
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

export default mongoose.model("ProductionPanel", ProductionPanelSchema)