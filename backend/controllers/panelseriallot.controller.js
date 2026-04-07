import mongoose from "mongoose";
import PanelSerialLot from "../models/PanelSerialLot.model.js";
import PanelNumber from "../models/PanelNumber.model.js";
import PanelCounter from "../models/PanelCounter.model.js";


export const getNextPanelNumber = async (req, res) => {
  try {
    const { prefix, panel_type, panel_capacity, date } = req.body;

    if (!prefix || !panel_type || !panel_capacity || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const year = new Date(date).getFullYear().toString().slice(-2);
    const month = (new Date(date).getMonth() + 1).toString().padStart(2, "0");
    const monthYear = month + year;

    const counter = await PanelCounter.findOne({
      prefix,
      panel_capacity,
      panel_type,
      monthYear,
    });

    let nextNumber = 1;

    if (counter) {
      nextNumber = counter.seq + 1;
    }

    return res.status(200).json({
      success: true,
      next_starting_no: nextNumber,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPanelSerialLot = async (req, res) => {
  try {
    const {
      total_panels,
      prefix,
      panel_type,
      panel_capacity,
      panel_category,
      date,
      panel_alot_state,
      panel_alot_project,
      starting_no,
      company_id,
      created_by,
      updated_by,
    } = req.body;

    /* ==========================
       1️⃣ Validation
    ========================== */
    if (
      !total_panels ||
      !prefix ||
      !panel_type ||
      !panel_capacity ||
      !date ||
      !panel_alot_state ||
      !panel_alot_project
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const totalPanelsNum = Number(total_panels);

    /* ==========================
       2️⃣ MonthYear
    ========================== */
    const d = new Date(date);
    const year = d.getFullYear().toString().slice(-2);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const monthYear = month + year;

    const formattedPanelType = String(panel_type);

    /* ==========================
       3️⃣ Counter Logic
    ========================== */
    let actualStartingNo;

    let counter = await PanelCounter.findOne({
      prefix: String(prefix).trim(),
      panel_capacity: String(panel_capacity).trim(),
      panel_type: String(panel_type).trim(),
      monthYear: String(monthYear).trim(),
    });

    if (counter) {
      // Continue sequence
      actualStartingNo = counter.seq + 1;
    } else {
      // First time → allow custom start
      actualStartingNo = starting_no ? Number(starting_no) : 1;

      counter = await PanelCounter.create({
        prefix: String(prefix).trim(),
        panel_capacity: String(panel_capacity).trim(),
        panel_type: String(panel_type).trim(),
        monthYear: String(monthYear).trim(),
        seq: 0,
      });
    }

    /* ==========================
       4️⃣ Create LOT
    ========================== */
    const lot = await PanelSerialLot.create({
      company_id,
      prefix,
      starting_no: actualStartingNo,
      date,
      panel_capacity,
      panel_type,
      panel_category,
      panel_alot_state,
      panel_alot_project,
      total_panels: totalPanelsNum,
      created_by,
      updated_by,
    });

    /* ==========================
       5️⃣ Update Counter (IMPORTANT)
    ========================== */
    const endingNo = actualStartingNo + totalPanelsNum - 1;

    counter.seq = endingNo;
    counter.last_lot_id = lot._id;
    await counter.save();

    /* ==========================
       6️⃣ Create PANELS
    ========================== */
    const panels = [];

    for (let i = 0; i < totalPanelsNum; i++) {
      const serial = actualStartingNo + i;

      if (serial <= 0) {
        throw new Error("Invalid serial generated");
      }

      const padded = String(serial).padStart(6, "0");

      panels.push({
        company_id,
        panel_lot_id: lot._id,
        panel_capacity,
        panel_type,
        panel_category,
        panel_lot_count: totalPanelsNum,
        panel_no: padded,
        panel_unique_no: `${prefix}${panel_capacity}${formattedPanelType}${monthYear}${padded}`,
      });
    }

    await PanelNumber.insertMany(panels);

    /* ==========================
       7️⃣ Response
    ========================== */
    return res.status(201).json({
      success: true,
      message: "Panel lot created successfully",
      starting_number: actualStartingNo,
      ending_number: endingNo,
    });

  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({
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
  try {
    const lot_id = req.params.id;
    const company_id = req.user?.company_id;

    if (!company_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    /* ==========================
       1️⃣ Get LOT
    ========================== */
    const lot = await PanelSerialLot.findOne({ _id: lot_id, company_id });
    if (!lot) return res.status(404).json({ success: false, message: "Lot not found" });

    /* ==========================
       2️⃣ Check USED PANELS
    ========================== */
    const usedPanel = await PanelNumber.exists({
      panel_lot_id: lot_id,
      company_id,
      $or: [{ production_status: { $ne: 0 } }, { dispatch_status: { $ne: 0 } }],
    });
    if (usedPanel) return res.status(400).json({ success: false, message: "Cannot delete. Panels already used." });

    /* ==========================
       3️⃣ Prepare COUNTER KEY
    ========================== */
    const d = new Date(lot.date);
    const monthYear = (d.getMonth() + 1).toString().padStart(2, "0") + d.getFullYear().toString().slice(-2);

    const counter = await PanelCounter.findOne({
      prefix: lot.prefix,
      panel_capacity: lot.panel_capacity,
      panel_type: lot.panel_type,
      monthYear,
    });

    if (!counter) return res.status(400).json({ success: false, message: "Counter not found" });

    const expectedLast = lot.starting_no + lot.total_panels - 1;

    /* ==========================
       Only last lot can be deleted
    ========================== */
    if (counter.last_lot_id?.toString() !== lot._id.toString() || counter.seq !== expectedLast) {
      return res.status(400).json({ success: false, message: "Only last lot can be deleted" });
    }

    /* ==========================
       Rollback counter
    ========================== */
    counter.seq = lot.starting_no - 1;
    counter.last_lot_id = undefined;
    await counter.save();

    /* ==========================
       Delete panels & lot
    ========================== */
    await Promise.all([
      PanelNumber.deleteMany({ panel_lot_id: lot_id, company_id }),
      PanelSerialLot.deleteOne({ _id: lot_id, company_id }),
    ]);

    return res.status(200).json({ success: true, message: "Lot deleted, panels removed, counter rolled back" });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, message: error.message });
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



