import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },

    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    whatsapp_no: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },

    gender: {
      type: String,
      required: true,
      enum: ["M", "F", "O"],
    },

    emp_image: {
      type: String,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },

    manager: {
      type: String,
      required: true,
    },

    state_access: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      trim: true,
    },

    project: {
      type: String,
      default: "",
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

export default mongoose.model("User", UserSchema);
