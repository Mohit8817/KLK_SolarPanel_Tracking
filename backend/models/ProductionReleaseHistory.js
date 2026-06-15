import mongoose from "mongoose";

const ProductionReleaseHistorySchema = new mongoose.Schema(
  {
    // Purana production panel
    old_production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionPanel",
      required: true,
    },

    // Naya production panel jo release ke baad bana
    new_production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionPanel",
      required: true,
    },

    company_id: {
      type: String,
      required: true,
      trim: true,
    },

    // Purane production mein pehle kitne panels the
    old_panel_count_before: {
      type: Number,
      required: true,
    },

    // Purane production mein release ke baad kitne bache
    old_panel_count_after: {
      type: Number,
      required: true,
    },

    // Kitne panels release kiye
    released_count: {
      type: Number,
      required: true,
    },

    // Naye production ka vendor
    new_vendor_id: {
      type: String,
      default: 0,
      trim: true,
    },

    // Released panel numbers
    released_panel_numbers: {
      type: [Number],
      default: [],
    },

    // Released panel unique numbers
    released_panel_unique_numbers: {
      type: [String],
      default: [],
    },

    // Kisne release kiya
    released_by: {
      type: String,
      trim: true,
    },

    // Kab release kiya
    released_date: {
      type: String,
      trim: true,
    },

    // Optional note
    remark: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ProductionReleaseHistory",
  ProductionReleaseHistorySchema
);