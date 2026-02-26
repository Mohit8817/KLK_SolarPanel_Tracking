// controllers/dashboardController.js

import PanelNumber from "../models/PanelNumber.model.js";
import DispatchPanel from "../models/dispatchpanel.model.js";
import DamagePanel from "../models/damagepanel.model.js";

export const getDashboardStats = async (req, res) => {
  try {

    /* ================= PRODUCTION ================= */

    // Total Panels Produced
    const totalPanelsProduced = await PanelNumber.countDocuments();

    // Today's Production
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProduction = await PanelNumber.countDocuments({
      createdAt: { $gte: today }
    });

    /* ================= DISPATCH ================= */

    const totalDispatch = await DispatchPanel.countDocuments();

    const pendingReceive = await DispatchPanel.countDocuments({
      collect_status: 0
    });

    const completedReceive = await DispatchPanel.countDocuments({
      collect_status: 1
    });

    /* ================= DAMAGE ================= */

    const productionDamage = await DamagePanel.countDocuments({
      damage_location_type: 2
    });

    const onsiteDamage = await DamagePanel.countDocuments({
      damage_location_type: 1
    });

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      data: {
        production: {
          totalPanelsProduced,
          todayProduction
        },
        dispatch: {
          totalDispatch,
          pendingReceive,
          completedReceive
        },
        damage: {
          productionDamage,
          onsiteDamage,
          totalDamage: productionDamage + onsiteDamage
        }
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};