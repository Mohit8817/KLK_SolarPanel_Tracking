import User from '../models/users.model.js'
import Role from '../models/Role.model.js'
import fs from 'fs';
import path from "path";

export const getAllUser = async (req, res) => {
  try {

    const users = await User.find()
      .populate("role", "name");

    res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


export const fetchUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message : 'User not find !!'})
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}


export const createUser = async (req, res) => {
  try {
    const company_id = req.user?.company_id;
    const user = new User({
      ...req.body,
      company_id
    });

    /* ===============================
       3️⃣ Handle image
    =============================== */
    if (!req.file) {
      return res.status(400).json({ message: "Image not uploaded" });
    }

    user.emp_image = req.file.filename;

    /* ===============================
       4️⃣ Save user
    =============================== */
    const newUser = await user.save();

    return res.status(200).json(newUser);

  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
};

export const updateUser = async(req,res) => {
  try {
    const existingUser = await User.findById(req.params.id);
    if(!existingUser) return res.status(404).json({message : 'User not found!'});

    if(req.file){
      if(existingUser.emp_image){
        const oldimage = path.join(process.cwd(), 'uploads', path.basename(existingUser.emp_image));
        if(fs.existsSync(oldimage)){
          fs.unlinkSync(oldimage);
        }
      }
      req.body.emp_image = req.file.filename;
    }

    const updateduser = await User.findByIdAndUpdate(req.params.id, req.body, {new : true});
    res.status(200).json(updateduser);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
}


export const deleteUser = async(req,res) => {
    try {
        const deleteduser = await User.findByIdAndDelete(req.params.id)
        if(!deleteduser) return res.status(404).json({message : 'User not find !!'})
        if(deleteduser.emp_image){
            const filepath = path.join('./uploads', deleteduser.emp_image);
            fs.unlink(filepath, (err) => {
              if(err) console.log('failed to Delete', err)
            })
        }
        
        res.status(200).json({message : 'User Deleted Successfully!!'})
    } catch (error) {
         res.status(400).json({message : message.error})
    }
}

export const getAllVendor = async (req, res) => {
  try {

    // FIND VENDOR ROLE
    const vendorRole = await Role.findOne({
      rolecode: "vendor"
    });

    if (!vendorRole) {
      return res.status(404).json({
        message: "Vendor role not found"
      });
    }
    const vendors = await User.find({
      role: vendorRole._id
    });

    res.status(200).json(vendors);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

