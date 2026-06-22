import mongoose from "mongoose";

const ProductionReleaseHistorySchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },
    old_production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionPanel",
      required: true,
    },
    new_production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionPanel",
      required: true,
    },
    start_panel_no:{
      type: Number,
      required: true,
    },
    end_panel_no:{
      type: Number,
      required: true,
    },
    old_panel_count_before: {
      type: Number,
      required: true,
    },
    old_panel_count_after: {
      type: Number,
      required: true,
    },
    released_count: {
      type: Number,
      required: true,
    },
    new_vendor_id: {
      type: String,
      default: 0,
      trim: true,
    },
    released_by: {
      type: String,
      trim: true,
    },
    released_date: {
      type: String,
      trim: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    status: {
      type: Number, default: 0,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);
export default mongoose.model(
  "ProductionReleaseHistory",
  ProductionReleaseHistorySchema
);