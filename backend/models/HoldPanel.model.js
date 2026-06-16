import mongoose from 'mongoose';

const HoldPanelSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },

    hold_date: {
      type: Date,
      required: true,
    },

    panel_count: {
      type: Number,
      required: true,
    },

    panel_capacity: {
      type: String,
      required: true,
      trim: true,
    },

    panel_type: {
    type: String,
    enum: ['1', '2'],
    required: true,
    },

    hold_status: {
    type: String,
    enum: ['H','R'],
    default: 'H',
    },
    
    reason: {
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

export default mongoose.model('HoldPanel', HoldPanelSchema);