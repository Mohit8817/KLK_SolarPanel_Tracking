import mongoose from 'mongoose'
import ExcelJS from "exceljs";
import ProductionPanel from "../models/ProductionPanel.model.js"
import PanelNumber from "../models/PanelNumber.model.js";


export const createProductionPanel = async (req, res) => {
  try {
    const {
      company_id,
      panel_capacity,
      panel_count,
      panel_type, // production panel type
      project,
      state,
      date,
      created_by,
    } = req.body;

    const count = Number(panel_count);

    if (!company_id || !panel_capacity || !panel_type || !project || !state || !date) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    /* ===============================
       1️⃣ Fetch available panels for production
       - Must match capacity & type
       - Must be unassigned (production_status = 0)
    =============================== */

      console.log(panel_capacity, panel_type);

    const panels = await PanelNumber.find({
      production_status: 0,
      panel_capacity: panel_capacity,
      panel_type: panel_type,
    })
      .sort({ createdAt: 1 })
      .limit(count);

    if (panels.length < count) {
      return res.status(400).json({
        success: false,
        message: `Not enough available panels. Requested: ${count}, Found: ${panels.length}`,
      });
    }

    /* ===============================
       2️⃣ Create production record
    =============================== */
    const productionPanel = await ProductionPanel.create({
      company_id,
      panel_capacity,
      panel_count: count,
      panel_type,
      project,
      state,
      date,
      created_by,
    });

    /* ===============================
       3️⃣ Assign panels to production
    =============================== */
    const panelIds = panels.map((p) => p._id);

    const result = await PanelNumber.updateMany(
      { _id: { $in: panelIds } },
      {
        $set: {
          production_id: productionPanel._id,
          production_lot_size: count,
          production_status: 1,
        },
      }
    );

    /* ===============================
       4️⃣ Response
    =============================== */
    res.status(201).json({
      success: true,
      message: "Production panel created successfully",
      data: {
        production_id: productionPanel._id,
        assigned_panels: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Production Panel Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const fetchAllProductionPanels = async (req, res) => {
  try {
    const productionPanels = await ProductionPanel.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productionPanels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchProductionPanelById = async (req, res) => {
  try {
    const { id } = req.params;

    const productionPanel = await ProductionPanel.findById(id);

    if (!productionPanel) {
      return res.status(404).json({
        success: false,
        message: "Production panel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: productionPanel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteProductionPanel = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check production panel exists
    const productionPanel = await ProductionPanel.findById(id);

    if (!productionPanel) {
      return res.status(404).json({
        success: false,
        message: "Production panel not found",
      });
    }

    // 2️⃣ Reset assigned panels
    await PanelNumber.updateMany(
      { production_id: productionPanel._id },
      {
        $set: {
          production_id: null,
          production_lot_size: null,
          production_status: 0,
        },
      }
    );

    // 3️⃣ Delete production panel
    await ProductionPanel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Production panel deleted and panels released",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPanelsByProductionId = async (req, res) => {
  try {
    const { id } = req.params;

    const panels = await PanelNumber.find({
      production_id: new mongoose.Types.ObjectId(id),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: panels.length,
      data: panels,
    });
  } catch (error) {
    console.error("Production Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch production panels",
    });
  }
};

export const exportProductionPanelNumbers = async (req, res) => {
  try {
    const { id } = req.params;

    const panels = await PanelNumber.find({
      production_id: new mongoose.Types.ObjectId(id),
    }).sort({ createdAt: 1 });

    if (!panels.length) {
      return res.status(404).json({
        success: false,
        message: "No panels found",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Panel Numbers");

    // Only 2 columns
    worksheet.columns = [
      { header: "Sr No", key: "sno", width: 10 },
      { header: "Panel No", key: "panel_no", width: 25 },
    ];

    panels.forEach((panel, index) => {
      worksheet.addRow({
        sno: index + 1,
        panel_no: panel.panel_unique_no,
      });
    });

    // Make header bold
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=production_panel_numbers.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export panel numbers",
    });
  }
};









