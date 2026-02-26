import mongoose from "mongoose";

const PanelNumberSchema = new mongoose.Schema(
  {
    panel_lot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PanelSerialLot",
      required: true,
    },

    panel_unique_no: {
      type: String,
      required: true,
      unique: true, // only unique field now
    },
    panel_no: {
      type: String,
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
      enum: [0, 1], // 0 = pending, 1 = assigned
      default: 0,
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
      enum: [1, 2], // 1 = DCR, 2 = NON DCR
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
