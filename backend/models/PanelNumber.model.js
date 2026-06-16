import mongoose from "mongoose";

const PanelNumberSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },
    panel_lot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PanelSerialLot",
      required: true,
    },
    panel_unique_no: {
      type: String,
      required: true,
      unique: true, 
    },
    panel_no: {
      type: Number,
      required: true,
    },
    panel_lot_count: {
      type: Number,
      required: true,
    },

    panel_capacity: {
      type: String,
      required: true,
      trim: true,
    },

    generated_year: {
      type: String,
      required: true,
      trim: true,
    },

    prefix: { type: String, required: true, trim: true, },

    state: {
      type: String,
      trim: true,
      uppercase: true,
    },

    panel_category: {
      type: Number,
      enum: [1, 2],
      trim: true,
      default: 0,
    },

     panel_type: {
      type: Number,
      enum: [1, 2, 3],
      trim: true,
    },

    hold_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HoldPanel",
    },

    hold_lot_size: {
      type: Number,
    },

    hold_status: {
    type: Number,
    enum: [0,1,2],
    default : 0
    },

    release_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReleasePanel",
    },

    release_lot_size: {
      type: Number,
    },

    // 🧩 Assignment
    production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionPanel",
    },
    production_lot_size: {
      type: Number,
    },
    production_status: {
      type: Number,
      enum: [0, 1, 2], 
      default: 0,
    },

    manufacturing_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    vendor_id: {
      type: String, default: 0,
      trim: true,
    },
    vendor_status: {
      type: Number, default: 0, 
      required: true,
      trim: true,
    },

    production_damage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DamagePanel",
    },
    production_damage_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    // 🚚 Dispatch
    dispatch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DispatchPanel",
    },
    dispatch_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    dispatch_panel_type: {
      type: Number,
      enum: [1, 2], 
      default: null,
    },

    // 🚚 Damage
    damage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DamagePanel",
    },
    damage_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    collect_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    
    collect_damage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DamagePanel",
    },

    collect_damage_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for performance
PanelNumberSchema.index({ panel_lot_id: 1 });
PanelNumberSchema.index({ dispatch_status: 1 });
PanelNumberSchema.index({ production_status: 1 });

export default mongoose.model("PanelNumber", PanelNumberSchema);
