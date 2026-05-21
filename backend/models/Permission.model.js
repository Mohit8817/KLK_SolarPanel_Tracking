import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim: true,
    },
    label : {
        type : String,
        required : true,
        trim: true,
    },
    permission_module : {
        type : String,
        required : true,
        trim: true,
    },
    status : {
        type : Boolean,
        default : true
    }
},
 { timestamps: true }
)

export default mongoose.model("Permission", PermissionSchema)