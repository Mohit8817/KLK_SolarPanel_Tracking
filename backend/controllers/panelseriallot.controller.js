import mongoose from "mongoose";
import PanelSerialLot from "../models/PanelSerialLot.model.js";
import PanelNumber from "../models/PanelNumber.model.js";
import PanelCounter from "../models/PanelCounter.model.js";

export const createPanelSerialLot = async (req, res) => {
  try {
    const {
      total_panels,
      prefix,
      panel_type,
      panel_capacity,
      panel_category,
      date,
      starting_no,
      company_id,
      created_by,
      updated_by,
    } = req.body;

    if (!total_panels || !prefix || !panel_type || !panel_capacity || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    /* ==========================
       1️⃣ Year & Month
    ========================== */
    const year = new Date(date).getFullYear().toString().slice(-2); // e.g., "26"
    const month = (new Date(date).getMonth() + 1).toString().padStart(2, "0"); // e.g., "02"
    const monthYear = month + year; // MMYY

    const formattedPanelType = String(panel_type);

    /* ==========================
       2️⃣ Get or create counter
       Uniqueness: prefix + capacity + type + monthYear
    ========================== */
    let counter = await PanelCounter.findOne({
      prefix,
      panel_capacity,
      panel_type,
      monthYear,
    });

    let actualStartingNo;
    if (counter) {
      // Continue from last sequence
      actualStartingNo = counter.seq + 1;
      counter.seq += Number(total_panels);
      await counter.save();
    } else {
      // New combination → use provided starting_no or default 1
      actualStartingNo = starting_no ? Number(starting_no) : 1;
      counter = await PanelCounter.create({
        prefix,
        panel_capacity,
        panel_type,
        monthYear,
        seq: actualStartingNo + Number(total_panels) - 1,
      });
    }

    /* ==========================
       3️⃣ Create LOT
    ========================== */
    const lot = await PanelSerialLot.create({
      company_id,
      prefix,
      starting_no: actualStartingNo,
      date,
      panel_capacity,
      panel_type,
      panel_category,
      total_panels,
      created_by,
      updated_by,
    });

    /* ==========================
       4️⃣ Generate PANELS
    ========================== */
    const panels = [];
    for (let i = 0; i < total_panels; i++) {
      const serial = actualStartingNo + i;
      const paddedSerial = String(serial).padStart(6, "0"); // 000001

      const panel_unique_no = `${prefix}${panel_capacity}${formattedPanelType}${monthYear}${paddedSerial}`;

      panels.push({
        panel_lot_id: lot._id,
        panel_capacity,
        panel_type,
        panel_category,
        panel_lot_count: total_panels,
        panel_no: paddedSerial,
        panel_unique_no,
      });
    }

    await PanelNumber.insertMany(panels);

    /* ==========================
       5️⃣ Response
    ========================== */
    res.status(201).json({
      success: true,
      message: "Panel lot created successfully",
      total_created: panels.length,
      starting_number: actualStartingNo,
    });
  } catch (error) {
    console.error("Create Panel Lot Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllPanelSerialLots = async (req, res) => {
  try {
    const lots = await PanelSerialLot.find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      total_records: lots.length,
      data: lots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePanelSerialLot = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // 1️⃣ Check if lot exists
    const lot = await PanelSerialLot.findById(id);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: "Panel lot not found",
      });
    }

    // 2️⃣ Delete all panels linked to this lot
    await PanelNumber.deleteMany(
      { panel_lot_id: id },
      { session }
    );

    // 3️⃣ Delete the lot
    await PanelSerialLot.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Panel lot and related panel numbers deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPanelsByLotId = async (req, res) => {
  try {
    const { id } = req.params; // this is panel_lot_id

     const panels = await PanelNumber.find({
     panel_lot_id: new mongoose.Types.ObjectId(id),
     });

    if (!panels || panels.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No panels found for this lot id",
      });
    }

    res.status(200).json({
      success: true,
      total: panels.length,
      data: panels,
    });
  } catch (error) {
    console.error("Error fetching panels:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



