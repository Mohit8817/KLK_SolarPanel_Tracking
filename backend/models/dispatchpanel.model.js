import mongoose from "mongoose";

const DispatchPanelSchema = new mongoose.Schema(
  {
    dispatch_id: {
      type: String,
      required: true,
      unique: true,
    },
    truck_no: {
      type: String,
      required: true,
      unique: true,
    },
    challan_no: {
      type: String,
      required: true,
      unique: true,
    },
    driver_name: {
      type: String,
      required: true,
    },
    driver_no: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    dispatch_panel_count: {
      type: Number,
    },
    collect_status : {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    collect_count : {
      type: Number,
      default: 0,
    },
    collect_date : {
      type: String,
    },
    collect_document: {
      type: String,
    },
    collect_remarks : {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("DispatchPanel", DispatchPanelSchema);
