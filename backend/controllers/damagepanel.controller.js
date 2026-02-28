import DamagePanel from "../models/damagepanel.model.js";
import PanelNumber from "../models/PanelNumber.model.js";
import mongoose from "mongoose";

export const createDamagePanel = async (req, res) => {
  try {
    let { panel_no, remarks } = req.body;
    const damage_location_type = Number(req.body.damage_location_type);

    // ✅ Validate damage type
    if (![1, 2, 3].includes(damage_location_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid damage_location_type",
      });
    }

    // ✅ Validate panel_no
    if (!panel_no || (Array.isArray(panel_no) && panel_no.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "panel_no is required",
      });
    }

    const panels = Array.isArray(panel_no) ? panel_no : [panel_no];

    const invalidPanels = [];
    const validPanels = [];

    // =====================================================
    // 1️⃣ VALIDATE PANELS
    // =====================================================

    for (let pNo of panels) {
      const panel = await PanelNumber.findOne({
        panel_unique_no: pNo,
      });

      if (!panel) {
        invalidPanels.push({
          panel_no: pNo,
          reason: "Panel not found",
        });
        continue;
      }

      // ---------- Production Damage ----------
      if (damage_location_type === 1) {
        if (panel.production_status !== 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Production not completed",
          });
          continue;
        }

        if (panel.production_damage_status === 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Already marked production damaged",
          });
          continue;
        }
      }

      // ---------- Dispatch Damage ----------
      if (damage_location_type === 2) {
        if (panel.dispatch_status !== 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Panel not dispatched yet",
          });
          continue;
        }

        if (panel.damage_status === 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Already marked dispatch damaged",
          });
          continue;
        }
      }

      // ---------- Collect/Site Damage ----------
      if (damage_location_type === 3) {
        if (panel.collect_status !== 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Panel not collected yet",
          });
          continue;
        }

        if (panel.collect_damage_status === 1) {
          invalidPanels.push({
            panel_no: pNo,
            reason: "Already marked collect damaged",
          });
          continue;
        }
      }

      validPanels.push(panel);
    }

    // ❌ Stop if invalid panels exist
    if (invalidPanels.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some panels failed validation",
        invalid_panels: invalidPanels,
      });
    }

    // =====================================================
    // 2️⃣ IMAGE
    // =====================================================

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const savedDamages = [];

    // =====================================================
    // 3️⃣ PROCESS PANELS
    // =====================================================

    for (let panel of validPanels) {

      if (damage_location_type === 1) {
        panel.production_damage_status = 1;
      }

      else if (damage_location_type === 2) {
        panel.damage_status = 1;
        panel.dispatch_status = 0;
      }

      else if (damage_location_type === 3) {
        panel.collect_damage_status = 1;
      }

      const damagePanel = await DamagePanel.create({
        panel_no: panel.panel_unique_no,
        damage_location_type,
        image: imagePath,
        remarks,
      });

      const damageId = damagePanel._id;

      if (damage_location_type === 1)
        panel.production_damage_id = damageId;

      if (damage_location_type === 2)
        panel.damage_id = damageId;

      if (damage_location_type === 3)
        panel.collect_id = damageId;

      await panel.save();

      savedDamages.push(damagePanel);
    }

    return res.status(201).json({
      success: true,
      message: "Damage recorded successfully",
      total_saved: savedDamages.length,
      data: savedDamages,
    });

  } catch (error) {
    console.error("CREATE DAMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


/* =========================================
   ✅ GET ALL DAMAGE PANELS
========================================= */
export const getAllDamagePanels = async (req, res) => {
  try {
    const damages = await DamagePanel.find().sort({ unique_id: -1 });

    res.status(200).json({
      success: true,
      total: damages.length,
      data: damages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================
   ✅ GET DAMAGE BY PANEL NO
========================================= */
export const getDamageByPanelNo = async (req, res) => {
  try {
    const { panel_no } = req.params;

    const damages = await DamagePanel.find({ panel_no });

    if (!damages.length) {
      return res.status(404).json({
        success: false,
        message: "No damage records found for this panel",
      });
    }

    res.status(200).json({
      success: true,
      total: damages.length,
      data: damages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================
   ✅ GET SINGLE DAMAGE BY unique_id
========================================= */
export const getDamageById = async (req, res) => {
  try {
    const { unique_id } = req.params;

    const damage = await DamagePanel.findOne({ unique_id });

    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: damage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================
   ✅ UPDATE DAMAGE PANEL
========================================= */
export const updateDamagePanel = async (req, res) => {
  try {
    const { unique_id } = req.params;

    const damage = await DamagePanel.findOneAndUpdate(
      { unique_id },
      req.body,
      { new: true }
    );

    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Damage updated successfully",
      data: damage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDamageTypeOnePanels = async (req, res) => {
  try {
    const damages = await DamagePanel.find({
      damage_location_type: 1,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      damages.map(async (damage) => {
        const panel = await PanelNumber.findOne({
          production_damage_id: damage._id,
        });

        return {
          ...damage.toObject(),
          panel_unique_no: panel?.panel_unique_no || null,
          panel_category: panel?.panel_category || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Type 1 Damage Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDamageTypeTwoPanels = async (req, res) => {
  try {
    const damages = await DamagePanel.find({
      damage_location_type: 2,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      damages.map(async (damage) => {
        const panel = await PanelNumber.findOne({
          damage_id: damage._id,
        });

        return {
          ...damage.toObject(),
          panel_unique_no: panel?.panel_unique_no || null,
          panel_category: panel?.panel_category || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Type 2 Damage Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getDamageTypeThreePanels = async (req, res) => {
  try {
    const damages = await DamagePanel.find({
      damage_location_type: 3,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      damages.map(async (damage) => {
        const panel = await PanelNumber.findOne({
          collect_id: damage._id,
        });

        return {
          ...damage.toObject(),
          panel_unique_no: panel?.panel_unique_no || null,
          panel_category: panel?.panel_category || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Type 3 Damage Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



