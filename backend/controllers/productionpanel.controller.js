import mongoose from 'mongoose'
import ExcelJS from "exceljs";
import ProductionPanel from "../models/ProductionPanel.model.js"
import PanelNumber from "../models/PanelNumber.model.js";
import ManufacturingPanel from '../models/ManufacturingPanel.model.js';
import ProductionReleaseHistory from '../models/ProductionReleaseHistory.js';
import User from '../models/users.model.js'
import Role from '../models/Role.model.js'
import { attachPrefixToRecords } from "../utils/attachPrefix.js";


export const createProductionPanel = async (req, res) => {
  try {
    const {
      company_id,
      panel_capacity,
      panel_count,
      panel_type,
      project,
      prefix,
      generated_year,
      state,
      date,
      created_by,
      vendor_id,
    } = req.body;

    /* ===============================
       1️⃣ Validation
    =============================== */

    const count = Number(panel_count);

    if (
      !company_id ||
      !panel_capacity ||
      !panel_type ||
      !project ||
      !state ||
      !date ||
      !count
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    /* ===============================
       2️⃣ Get Available Panels
    =============================== */

   const availablePanels = await PanelNumber.find({
      production_status: 0,
      hold_status: 0,
      production_id: null,
      prefix: String(prefix).trim(),
      generated_year: String(generated_year).trim(),
      panel_capacity: String(panel_capacity).trim(),
      panel_type: String(panel_type).trim(),
    })
    .sort({ panel_no: 1 })
    .limit(count);

    /* ===============================
       3️⃣ Check Availability
    =============================== */

    if (availablePanels.length < count) {
      return res.status(400).json({
        success: false,
        message: `Not enough panels available. Only ${availablePanels.length} panels found`,
      });
    }

    /* ===============================
       4️⃣ Create Production Record
    =============================== */

    const productionPanel =
      await ProductionPanel.create({
        company_id,
        panel_capacity,
        panel_count: count,
        old_panel_count:count,
        panel_type,
        project,
        state,
        date,
        created_by,
        vendor_id,
        vendor_status: vendor_id == 0 ? 0 : 1,
      });

    const productionId = productionPanel._id;

    /* ===============================
       5️⃣ Bulk Update Panels
    =============================== */

    const panelIds = availablePanels.map(
      (p) => p._id
    );

    await PanelNumber.updateMany(
      {
        _id: { $in: panelIds },
      },
      {
        $set: {
          production_id: productionId,
          production_lot_size: count,
          production_status: 1,
          vendor_id: productionPanel.vendor_id,
          vendor_status: productionPanel.vendor_id == 0 ? 0 : 1, // if vendor assigned to production, mark panel as assigned
        },
      }
    );

    /* ===============================
       6️⃣ Response
    =============================== */

    return res.status(201).json({
      success: true,

      message:
        "Production panel created successfully",

      data: {
        production_id: productionId,

        assigned_panels:
          availablePanels.length,

        panel_numbers:
          availablePanels.map(
            (p) => p.panel_no
          ),

        panel_unique_numbers:
          availablePanels.map(
            (p) => p.panel_unique_no
          ),
      },
    });
  } catch (error) {
    console.error(
      "Production Panel Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};


export const fetchAllProductionPanels = async (req, res) => {
  try {
    const productionPanels = await ProductionPanel.find(
      { vendor_status: 0 }
    )
      .sort({ date: -1 });

    const data = await attachPrefixToRecords(productionPanels, "production_id");

    res.status(200).json({
      success: true,
      data,
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

    const productionPanel = await ProductionPanel.findById(id).sort({ panel_no: -1 });;

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

    const productionPanel = await ProductionPanel.findById(id);

    if (!productionPanel) {
      return res.status(404).json({
        success: false,
        message: "Production panel not found",
      });
    }

    const dispatchedPanel = await PanelNumber.findOne({
      production_id: productionPanel._id,


      dispatch_status: 1,
    });


    if (dispatchedPanel) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete production lot because some panels are already dispatched",
      });
    }


    await PanelNumber.updateMany(
      {
        production_id: productionPanel._id,
      },
      {
        $set: {
          production_id: null,
          production_lot_size: null,
          production_status: 0,
        },
      }
    );

    await ProductionPanel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Production panel deleted ",
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
    const vendorRole = await Role.findOne({ rolecode: "vendor" });
    const isVendor =
      vendorRole && String(loginUser.role) === String(vendorRole._id);

    const productionPanels = await ProductionPanel.find({
      vendor_status: 1,
      ...(isVendor && { vendor_id: String(loginUser.id) }),
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
    const data = await attachPrefixToRecords(finalData, "production_id");
    return res.status(200).json({
      success: true,
      data,
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
      production_id: new mongoose.Types.ObjectId(production_id),
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

    const data = await attachPrefixToRecords(panels, "production_id");

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const releaseProductionPanel = async (req, res) => {
  try {
    const {
      production_id,
      new_vendor_id,
      release_count,
      start_panel_no,
      end_panel_no,
      new_project,
      new_state,
      remark,
    } = req.body;
    const count = Number(release_count);
    const today = new Date().toISOString().split("T")[0];

    const created_by = req.user?.id;

    if (!production_id || !count) {
      return res.status(400).json({
        success: false,
        message: "production_id and release_count are required",
      });
    }
    if (
      !start_panel_no ||
      !end_panel_no ||
      Number(start_panel_no) > Number(end_panel_no)
    ) {
      return res.status(400).json({
        success: false,
        message:
          !start_panel_no || !end_panel_no
            ? "Start Panel No and End Panel No are required."
            : "Start Panel No cannot be greater than End Panel No.",
      });
    }

    const oldProduction = await ProductionPanel.findById(production_id);
    if (!oldProduction) {
      return res.status(404).json({
        success: false,
        message: "Production panel not found",
      });
    }
    if (count > oldProduction.panel_count) {
      return res.status(400).json({
        success: false,
        message: `Cannot release ${count} panels. Total panels: ${oldProduction.panel_count}.`,
      });
    }

    const panelsToRelease = await PanelNumber.find({
      production_id: oldProduction._id,
      production_status: 1,
      panel_no: {
        $gte: Number(start_panel_no),
        $lte: Number(end_panel_no),
      },
    }).sort({ panel_no: 1 });

    if (!panelsToRelease.length) {
      return res.status(400).json({
        success: false,
        message: "No panels found in the selected range.",
      });
    }

    if (panelsToRelease.length !== count) {
      return res.status(400).json({
        success: false,
        message: `release_count (${count}) does not match the number of panels found in range (${panelsToRelease.length}).`,
      });
    }

    const [newProduction] = await ProductionPanel.create([
      {
        company_id: oldProduction.company_id,
        panel_capacity: oldProduction.panel_capacity,
        panel_count: count,
        old_panel_count:count,
        panel_type: oldProduction.panel_type,
        project: new_project,
        state: new_state,
        date: today,
        created_by: created_by || oldProduction.created_by,
        vendor_id: new_vendor_id || 0,
        vendor_status: new_vendor_id ? 1 : 0,
      },
    ]);

    const oldPanelCountBefore = oldProduction.panel_count;
    const oldPanelCountAfter = oldProduction.panel_count - count;

    await ProductionPanel.findByIdAndUpdate(production_id, {
      $inc: { panel_count: -count },
      updated_by: created_by,
    });

    const [releaseHistory] = await ProductionReleaseHistory.create([
      {
        old_production_id: oldProduction._id,
        new_production_id: newProduction._id,
        company_id: oldProduction.company_id,
        start_panel_no: Number(start_panel_no),
        end_panel_no: Number(end_panel_no),
        old_panel_count_before: oldPanelCountBefore,
        old_panel_count_after: oldPanelCountAfter,
        released_count: count,
        new_vendor_id: new_vendor_id || 0,
        released_by: created_by,
        released_date: today,
        remark: remark || null,
        status: new_vendor_id ? 1 : 0,
      },
    ]);

    const panelIds = panelsToRelease.map((p) => p._id);

    await PanelNumber.updateMany(
      { _id: { $in: panelIds } },
      {
        $set: {
          production_id: newProduction._id,
          production_lot_size: count,
          vendor_id: new_vendor_id || 0,
          vendor_status: new_vendor_id ? 1 : 0,
          vendor_release_status: 1,
        },
        $addToSet: { vendor_release_id: releaseHistory._id },
      }
    );

    const resultPayload = {
      old_production: {
        production_id: oldProduction._id,
        panel_count_before: oldPanelCountBefore,
        panel_count_after: oldPanelCountAfter,
      },
      new_production: {
        production_id: newProduction._id,
        panel_count: count,
        vendor_id: new_vendor_id || 0,
        vendor_status: new_vendor_id ? 1 : 0,
        panel_numbers: panelsToRelease.map((p) => p.panel_no),
        panel_unique_numbers: panelsToRelease.map((p) => p.panel_unique_no),
      },
    };

    return res.status(201).json({
      success: true,
      message: "Panels released and new production record created successfully",
      data: resultPayload,
    });
  } catch (error) {
    console.error("Release Production Panel Error:", error);
    const status = error?.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};


export const getProductionReleaseHistory = async (req, res) => {
  try {
    const { production_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(production_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid production_id",
      });
    }
    const history = await ProductionReleaseHistory.find({
      old_production_id: production_id,
    }).sort({ createdAt: -1 });
    const historyWithPanels = await Promise.all(
      history.map(async (item) => {
        const panels = await PanelNumber.find({
          vendor_release_id: item._id,
        })
          .select("panel_no panel_unique_no prefix")
          .sort({ panel_no: 1 });

        const vendor =
          item.new_vendor_id && item.new_vendor_id !== "0"
            ? await User.findById(item.new_vendor_id).select(
                "first_name last_name email whatsapp_no"
              )
            : null;
        return {
          ...item.toObject(),
          vendor,
          panels,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: historyWithPanels,
    });
  } catch (error) {
    console.error("Get Production Release History Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getVendorPanelsByProductionId = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await ProductionReleaseHistory.find({
      old_production_id: new mongoose.Types.ObjectId(id),
    }).select("_id");

    const historyIds = history.map((item) => item._id);
    const historyIdStrings = new Set(historyIds.map(String));

    const panels = await PanelNumber.find({
      $or: [
        { production_id: new mongoose.Types.ObjectId(id) },
        { vendor_release_id: { $in: historyIds } },
      ],
    }).sort({ panel_no: 1 });

    const panelData = panels.map((panel) => {
      const releaseIds = (panel.vendor_release_id || []).map(String);
      return {
        ...panel.toObject(),
        release_status: releaseIds.some((rid) => historyIdStrings.has(rid))
          ? 1
          : 0,
      };
    });

    return res.status(200).json({
      success: true,
      total: panelData.length,
      data: panelData,
    });
  } catch (error) {
    console.error("Production Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch production panels",
    });
  }
};