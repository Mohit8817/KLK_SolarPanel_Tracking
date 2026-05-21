import mongoose from 'mongoose'
import ExcelJS from "exceljs";
import ProductionPanel from "../models/ProductionPanel.model.js"
import PanelNumber from "../models/PanelNumber.model.js";
import ManufacturingPanel from '../models/ManufacturingPanel.model.js';
import User from '../models/users.model.js'


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
    }).sort({ panel_no: 1 });

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


export const viewVendorProductionPanels = async (req, res) => {
  try {
    const loginUser = req.user;
    console.log("Login User:", loginUser);
    const productionPanels = await ProductionPanel.find({
      vendor_status: 1,
      ...(loginUser.role === "vendor" && {
        vendor_id: loginUser
      })

    }).sort({ createdAt: -1 });
    const finalData = await Promise.all(
      productionPanels.map(async (panel) => {
        const vendor = await User.findById(panel.vendor_id);
        return {
          ...panel._doc,
          vendor_details: vendor
            ? {
              _id: vendor._id,
              first_name: vendor.first_name,
              last_name: vendor.last_name,
              email: vendor.email,
              whatsapp_no: vendor.whatsapp_no,
            }
            : null,
        };

      })

    );
    return res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const createManufacturingPanel = async (req, res) => {
  try {
    const {
      production_id,
      panel_count,
      shift,
      date,
      remarks,
      created_by,
    } = req.body;

    const count = Number(panel_count);

    // Validation
    if (!production_id || !shift || !date || isNaN(count) || count <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(production_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid production_id"
      });
    }

    const production = await ProductionPanel.findById(production_id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Production not found"
      });
    }

    const panels = await PanelNumber.find({
      production_status: 1,
      manufacturing_status: { $ne: 1 }
    }).limit(Number(count));


    if (panels.length < count) {
      return res.status(400).json({
        success: false,
          message: `Not enough available panels. Requested: ${count}, Found: ${panels.length}`,
      });
    }

    const manufacturingPanel = await ManufacturingPanel.create({
      company_id: production.company_id,
      production_id,
      panel_capacity: production.panel_capacity,
      panel_type: production.panel_type,
      panel_count: count,
      shift,
      date,
      remarks,
      created_by,
    });

    const panelIds = panels.map(p => p._id);

    await PanelNumber.updateMany(
      { _id: { $in: panelIds }, manufacturing_status: { $ne: 1 } },
      { $set: { manufacturing_status: 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Manufacturing panel created successfully",
      data: manufacturingPanel
    });

  } catch (error) {
    console.error("Error creating manufacturing panel:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const getAllManufacturingPanels = async (req, res) => {
  try {
    // const { production_id } = req.query;
    const { production_id } = req.params;

    if (!production_id || !mongoose.Types.ObjectId.isValid(production_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid production_id is required"
      });
    }

    const panels = await ManufacturingPanel
      .find({ production_id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: panels
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};









