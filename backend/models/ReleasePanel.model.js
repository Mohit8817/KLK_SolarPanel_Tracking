import mongoose from "mongoose";

const ReleasePanelSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },

    hold_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HoldPanel",
      required: true,
    },

    hold_lot_size: {
      type: Number,
      required: true,
    },

    release_date: {
      type: Date,
      required: true,
    },

    release_count: {
      type: Number,
      required: true,
      min: 1,
    },

    start_panel_no: {
    type: Number,
    required: true
    },

    end_panel_no: {
        type: Number,
        required: true
    },

    production_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductionPanel"
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

    remarks: {
      type: String,
      required: true,
      trim: true,
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

export default mongoose.model("ReleasePanel", ReleasePanelSchema);