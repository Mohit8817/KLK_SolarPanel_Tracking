import mongoose from "mongoose";

const DamagePanelSchema = new mongoose.Schema(
  {
    panel_no: {
      type: String,
      required: true,
      index: true,
    },

    damage_location_type: {
        type: Number,
        enum: [0, 1, 2,3],
        default: 0,
        },


    image: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DamagePanel", DamagePanelSchema);
