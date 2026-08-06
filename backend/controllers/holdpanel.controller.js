import mongoose from "mongoose";
import HoldPanel from '../models/HoldPanel.model.js'
import PanelNumber from '../models/PanelNumber.model.js'
import PanelSerialLot from "../models/PanelSerialLot.model.js";
import ReleasePanel from "../models/ReleasePanel.model.js";
import ProductionPanel from "../models/ProductionPanel.model.js";
import { attachPrefixToRecords } from "../utils/attachPrefix.js";



export const getHoldCapacity = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const capacities = await PanelNumber.distinct("panel_capacity", {
      company_id,
      production_status: 0,
      hold_status: 0,
    });

    return res.status(200).json({
      success: true,
      data: capacities.sort(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Generated Years By Capacity
 */
export const getGeneratedYearByCapacity = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { panel_capacity } = req.query;

    if (!panel_capacity) {
      return res.status(400).json({
        success: false,
        message: "panel_capacity is required",
      });
    }

    const years = await PanelNumber.distinct("generated_year", {
      company_id,
      panel_capacity,
      production_status: 0,
      hold_status: 0,
    });

    return res.status(200).json({
      success: true,
      data: years.sort(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Prefix By Capacity + Year
 */
export const getCompanyPrefix = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const {
      panel_capacity,
      generated_year,
    } = req.query;

    if (!panel_capacity || !generated_year) {
      return res.status(400).json({
        success: false,
        message: "panel_capacity and generated_year are required",
      });
    }

    const prefixes = await PanelNumber.distinct("prefix", {
      company_id,
      panel_capacity,
      generated_year,
      production_status: 0,
      hold_status: 0,
    });

    return res.status(200).json({
      success: true,
      data: prefixes.sort(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Panel Types By Capacity + Year + Prefix
 */
export const getPanelType = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const {
      panel_capacity,
      generated_year,
      prefix,
    } = req.query;

    if (!panel_capacity || !generated_year || !prefix) {
      return res.status(400).json({
        success: false,
        message:
          "panel_capacity, generated_year and prefix are required",
      });
    }

    const panelTypes = await PanelNumber.aggregate([
      {
        $match: {
          company_id,
          panel_capacity,
          generated_year,
          prefix,
          production_status: 0,
          hold_status: 0,
        },
      },
      {
        $group: {
          _id: "$panel_type",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: panelTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Available Panel Count
 */
export const getAvailablePanelCount = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const {
      panel_capacity,
      generated_year,
      prefix,
      panel_type,
    } = req.query;

    if (
      !panel_capacity ||
      !generated_year ||
      !prefix ||
      !panel_type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "panel_capacity, generated_year, prefix and panel_type are required",
      });
    }

    const filter = {
      company_id,
      panel_capacity,
      generated_year,
      prefix,
      panel_type: Number(panel_type),
      production_status: 0,
      hold_status: 0,
    };

    const count = await PanelNumber.countDocuments(filter);

    const firstAvailable = await PanelNumber.findOne(filter)
      .sort({ panel_no: 1 })
      .select("panel_no panel_unique_no");

    return res.status(200).json({
      success: true,
      available_count: count,
      starting_panel_no: firstAvailable?.panel_no || null,
      starting_panel_unique_no:
        firstAvailable?.panel_unique_no || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const createHoldPanel = async (req, res) => {
  try {

    const company_id = req.user.company_id
    const userEmail = req.user.email
    const {
      _id,
      hold_date,
      panel_count,
      panel_capacity,
      panel_type,
      generated_year,
      prefix,
      reason
    } = req.body;

    const count = Number(panel_count);

    /* ===============================
       Validation
    =============================== */

    if (
      !company_id ||
      !hold_date ||
      !panel_capacity ||
      !panel_type ||
      !reason ||
      !count
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    /* ===============================
       Get Available Panels
    =============================== */

    const availablePanels = await PanelNumber.find({
      company_id,
      panel_capacity: String(panel_capacity),
      generated_year,
      prefix,
      panel_type: Number(panel_type),

      production_status: 0,
      hold_status: 0,
    })
    .sort({ panel_no: 1 })
    .limit(count);

    /* ===============================
       Availability Check
    =============================== */

    if (availablePanels.length < count) {
      return res.status(400).json({
        success: false,
        message: `Only ${availablePanels.length} panels available`,
      });
    }

    /* ===============================
       Create Hold Lot
    =============================== */

    const holdPanel = await HoldPanel.create({
      company_id,
      hold_date,
      panel_count: count,
      panel_capacity,
      panel_type,
      reason,
      created_by : userEmail,
      hold_status: "H",
    });

    const holdId = holdPanel._id;

    /* ===============================
       Update Panels
    =============================== */

    const panelIds = availablePanels.map(
      (panel) => panel._id
    );

    await PanelNumber.updateMany(
      {
        _id: {
          $in: panelIds,
        },
      },
      {
        $set: {
          hold_id: holdId,
          hold_lot_size: count,
          hold_status: 1,
          production_status: 2,
        },
      }
    );

    /* ===============================
       Response
    =============================== */

    return res.status(201).json({
      success: true,
      message: "Panels hold successfully",

      data: {
        hold_id: holdId,

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
      "Hold Panel Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const fetchAllHoldPanels = async (req, res) => {
  try {
    const holdPanels = await HoldPanel.find({})
      .sort({ hold_date: -1 });

    const data = await attachPrefixToRecords(holdPanels, "hold_id");

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


export const fetchHoldPanelById = async (req, res) => {
  try {
    const { id } = req.params;

    const holdPanel = await HoldPanel.findById(id);

    if (!holdPanel) {
      return res.status(404).json({
        success: false,
        message: "Hold panel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: holdPanel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPanelsByHoldPanelById = async (req, res) => {
  try {
    const { id } = req.params;

    const panels = await PanelNumber.find({
      hold_id: new mongoose.Types.ObjectId(id),
    }).sort({ panel_no: 1 });

    res.status(200).json({
      success: true,
      total: panels.length,
      data: panels,
    });
  } catch (error) {
    console.error("Hold Production Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Hold panels",
    });
  }
};



export const getHoldDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const firstPanel = await PanelNumber
            .findOne({
                hold_id: id,
                hold_status: 1
            })
            .sort({ panel_no: 1 });

        const lastPanel = await PanelNumber
            .findOne({
                hold_id: id,
                hold_status: 1
            })
            .sort({ panel_no: -1 });

        if (!firstPanel || !lastPanel) {
            return res.status(404).json({
                success: false,
                message: "No hold panels found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                starting_no: firstPanel.panel_no,
                ending_no: lastPanel.panel_no,
                first_panel_unique_no: firstPanel.panel_unique_no,
                last_panel_unique_no: lastPanel.panel_unique_no,
                panel_capacity: firstPanel.panel_capacity,
                panel_type: firstPanel.panel_type,
                panel_count: await PanelNumber.countDocuments({
                    hold_id: id,
                    hold_status: 1
                })
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const releasePanel = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const created_by = req.user.email;

        const {
            hold_id,
            start_panel_no,
            release_date,
            release_count,
            project,
            state,
            remarks
        } = req.body;

        // Validation
        if (
            !hold_id ||
            !start_panel_no ||
            !release_date ||
            !release_count ||
            !project ||
            !state
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

        // Hold Lot
        const holdPanel = await HoldPanel.findOne({
            _id: hold_id,
            company_id
        });

        if (!holdPanel) {
            return res.status(404).json({
                success: false,
                message: "Hold panel not found"
            });
        }

        // Get panels available for release
        const selectedPanels = await PanelNumber.find({
            hold_id,
            hold_status: 1,
            panel_no: { $gte: Number(start_panel_no) }
        })
            .sort({ panel_no: 1 })
            .limit(Number(release_count));

        if (selectedPanels.length < Number(release_count)) {
            return res.status(400).json({
                success: false,
                message: `Cannot release ${release_count} panels from panel no ${start_panel_no}. Only ${selectedPanels.length} panels available.`
            });
        }

        const panelIds = selectedPanels.map(item => item._id);

        const end_panel_no =
            selectedPanels[selectedPanels.length - 1].panel_no;

        // Create Production Entry
        const production = await ProductionPanel.create({
            company_id,
            panel_capacity: holdPanel.panel_capacity,
            panel_count: Number(release_count),
            panel_type: holdPanel.panel_type,
            project,
            state,
            date: release_date,
            vendor_status: 0,
            created_by
        });

        // Create Release Entry
        const release = await ReleasePanel.create({
            company_id,
            hold_id,
            production_id: production._id,

            hold_lot_size: holdPanel.panel_count,

            release_date,
            release_count,

            start_panel_no,
            end_panel_no,

            project,
            state,
            remarks,

            created_by
        });

        // Update Panel Numbers
        await PanelNumber.updateMany(
            {
                _id: { $in: panelIds }
            },
            {
                $set: {
                    release_id: release._id,
                    production_id: production._id,

                    release_lot_size: Number(release_count),

                    hold_status: 2,
                    production_status: 1,

                    updated_by: created_by
                }
            }
        );

        // Check remaining hold panels
        const remainingPanels = await PanelNumber.countDocuments({
            hold_id,
            hold_status: 1
        });

        // If all hold panels released
        if (remainingPanels === 0) {
            await HoldPanel.findByIdAndUpdate(
                hold_id,
                {
                    hold_status: "R",
                    updated_by: created_by
                }
            );
        }

        return res.status(201).json({
            success: true,
            message: "Panels released successfully",
            data: {
                hold_id,
                release_id: release._id,
                production_id: production._id,
                start_panel_no,
                end_panel_no,
                released_panels: Number(release_count)
            }
        });

    } catch (error) {
        console.error("Release Panel Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getReleasePanels = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const { hold_id } = req.params;

        const releases = await ReleasePanel.find({
            company_id,
            hold_id
        })
        .sort({ createdAt: -1 })
        .populate("production_id");

        const data = await attachPrefixToRecords(releases, "release_id");

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error("Get Release Panels Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};