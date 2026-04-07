// controllers/dashboardController.js

import PanelNumber from "../models/PanelNumber.model.js";
import DispatchPanel from "../models/dispatchpanel.model.js";
import DamagePanel from "../models/damagepanel.model.js";

// export const getDashboardStats = async (req, res) => {




//   try {

//     /* ================= PRODUCTION ================= */

//     // Total Panels Produced
//     const totalPanelsProduced = await PanelNumber.countDocuments();

//     // Today's Production
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayProduction = await PanelNumber.countDocuments({
//       createdAt: { $gte: today }
//     });

//     /* ================= DISPATCH ================= */

//     const totalDispatch = await DispatchPanel.countDocuments();

//     const pendingReceive = await DispatchPanel.countDocuments({
//       collect_status: 0
//     });

//     const completedReceive = await DispatchPanel.countDocuments({
//       collect_status: 1
//     });

//     /* ================= DAMAGE ================= */

//     const productionDamage = await DamagePanel.countDocuments({
//       damage_location_type: 2
//     });

//     const onsiteDamage = await DamagePanel.countDocuments({
//       damage_location_type: 1
//     });

//     /* ================= RESPONSE ================= */

//     return res.status(200).json({
//       success: true,
//       data: {
//         production: {
//           totalPanelsProduced,
//           todayProduction
//         },
//         dispatch: {
//           totalDispatch,
//           pendingReceive,
//           completedReceive
//         },
//         damage: {
//           productionDamage,
//           onsiteDamage,
//           totalDamage: productionDamage + onsiteDamage
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Dashboard Error:", error);
//     res.status(500).json({ message: "Dashboard fetch failed" });
//   }
// };












export const getDashboardStats = async (req, res) => {
  try {

    /* ================= DATE HELPERS ================= */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    /* ================= PRODUCTION ================= */

    // Total panels where production is complete (production_status: 1)
    const totalPanelsProduced = await PanelNumber.countDocuments({});
    const totalProduction = await PanelNumber.countDocuments({
        production_status: 1,
    });

    // Today's produced panels
    const todayProduction = await PanelNumber.countDocuments({
      production_status: 1,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Panels damaged during production
    const productionDamaged = await PanelNumber.countDocuments({
      production_damage_status: 1,
    });

    /* ================= DISPATCH ================= */

    // Total dispatched panels
    const totalDispatched = await PanelNumber.countDocuments({
      dispatch_status: 1,
    });

    // Dispatched but not yet collected by site
    const dispatchedNotCollected = await PanelNumber.countDocuments({
      dispatch_status: 1,
      collect_status: 0,
    });

    // Dispatched and successfully collected
    const dispatchedAndCollected = await PanelNumber.countDocuments({
      dispatch_status: 1,
      collect_status: 1,
    });

    /* ================= DAMAGE ================= */

    // Damaged during collection/onsite (after dispatch)
    const dispatchedDamaged = await PanelNumber.countDocuments({
      collect_damage_status: 1,
    });

    // Overall damage (production + collection)
    const totalDamage = productionDamaged + dispatchedDamaged;

    /* ================= STOCK ================= */

    // Panels produced but not yet dispatched (in stock)
    const inStock = await PanelNumber.countDocuments({
      production_status: 0,
      production_damage_status: 0,
    });

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      data: {
                stock: {
          totalPanelsProduced,
          inStock,
        },
        production: {
          totalProduction,
          todayProduction,
          productionDamaged,
        },
        dispatch: {
          totalDispatched,
          dispatchedNotCollected,
          dispatchedAndCollected,
        },
        damage: {
          productionDamaged,
          dispatchedDamaged,
          totalDamage,
        },

      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Dashboard fetch failed" });
  }
};