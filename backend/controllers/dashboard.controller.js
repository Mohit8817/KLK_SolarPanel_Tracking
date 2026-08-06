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

    const panelBreakdownPipeline = (groupField) => [
      {
        $match: {
          [groupField.replace("$", "")]: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: groupField,
          total: { $sum: 1 },
          totalProduced: {
            $sum: { $cond: [{ $eq: ["$production_status", 1] }, 1, 0] },
          },
          productionDamaged: {
            $sum: { $cond: [{ $eq: ["$production_damage_status", 1] }, 1, 0] },
          },
          totalDispatched: {
            $sum: { $cond: [{ $eq: ["$dispatch_status", 1] }, 1, 0] },
          },
          DispatchedDamaged: {
            $sum: { $cond: [{ $eq: ["$damage_status", 1] }, 1, 0] },
          },
          dispatchedNotCollected: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$dispatch_status", 1] }, { $eq: ["$collect_status", 0] }] },
                1, 0,
              ],
            },
          },
          dispatchedAndCollected: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$dispatch_status", 1] }, { $eq: ["$collect_status", 1] }] },
                1, 0,
              ],
            },
          },
          dispatchedAndCollectedDamaged: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$dispatch_status", 1] }, { $eq: ["$collect_damage_status", 1] }] },
                1, 0,
              ],
            },
          },
          totalDamage: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$production_damage_status", 1] },
                    { $eq: ["$damage_status", 1] },
                    { $eq: ["$collect_damage_status", 1] },
                  ],
                },
                1, 0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

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
    const dispatchedAndCollectedDamaged = await PanelNumber.countDocuments({
      collect_damage_status: 1,
    });

    /* ================= DAMAGE ================= */

    // Damaged during collection/onsite (after dispatch)
    const dispatchedDamaged = await PanelNumber.countDocuments({
      damage_status: 1,
    });

    // Overall damage (production + collection)
    const totalDamage = productionDamaged + dispatchedDamaged+dispatchedAndCollectedDamaged;

    /* ================= STOCK ================= */

    // Panels produced, not dispatched, not damaged — ready for dispatch
    const inStock = await PanelNumber.countDocuments({
      production_status: 1,
      dispatch_status: 0,
      production_damage_status: 0,
      damage_status: 0,
      collect_damage_status: 0,
    });

    const pendingProduction = await PanelNumber.countDocuments({
      production_status: { $ne: 1 },
      production_damage_status: 0,
      hold_status: { $ne: 1 },
    });

    const onHold = await PanelNumber.countDocuments({
      hold_status: 1,
    });

    const readyToDispatch = inStock;

    const safePanelsReceived = await PanelNumber.countDocuments({
      dispatch_status: 1,
      collect_status: 1,
      collect_damage_status: 0,
    });



    const panelCapacityWise = await PanelNumber.aggregate(
      panelBreakdownPipeline("$panel_capacity")
    );

    const panelPrefixWiseRaw = await PanelNumber.aggregate(
      panelBreakdownPipeline("$prefix")
    );

    const prefixCapacityCounts = await PanelNumber.aggregate([
      {
        $match: {
          prefix: { $exists: true, $nin: [null, ""] },
          panel_capacity: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: { prefix: "$prefix", capacity: "$panel_capacity" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.prefix": 1, "_id.capacity": 1 } },
    ]);

    const capacitiesByPrefix = prefixCapacityCounts.reduce((acc, row) => {
      const prefix = row._id.prefix;
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push({
        capacity: row._id.capacity,
        count: row.count,
      });
      return acc;
    }, {});

    const panelPrefixWise = panelPrefixWiseRaw.map((row) => ({
      ...row,
      capacities: capacitiesByPrefix[row._id] || [],
    }));



    /* ================= MONTH-WISE ================= */
const monthWiseData = await PanelNumber.aggregate([
  // {
  //   $match: { company_id: companyId }
  // },
  {
    $group: {
      _id: {
        year:  { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },

      // Total panels created that month
      totalGenerated: { $sum: 1 },

      // Production
      totalProduction: {
        $sum: { $cond: [{ $eq: ["$production_status", 1] }, 1, 0] },
      },
      productionDamaged: {
        $sum: { $cond: [{ $eq: ["$production_damage_status", 1] }, 1, 0] },
      },

      // Dispatch
      totalDispatched: {
        $sum: { $cond: [{ $eq: ["$dispatch_status", 1] }, 1, 0] },
      },
      dispatchedNotCollected: {
        $sum: {
          $cond: [
            { $and: [{ $eq: ["$dispatch_status", 1] }, { $eq: ["$collect_status", 0] }] },
            1, 0,
          ],
        },
      },
      dispatchedAndCollected: {
        $sum: {
          $cond: [
            { $and: [{ $eq: ["$dispatch_status", 1] }, { $eq: ["$collect_status", 1] }] },
            1, 0,
          ],
        },
      },

      // Damage (all types)
      dispatchedDamaged: {
        $sum: { $cond: [{ $eq: ["$damage_status", 1] }, 1, 0] },
      },
      collectDamaged: {
        $sum: { $cond: [{ $eq: ["$collect_damage_status", 1] }, 1, 0] },
      },
      totalDamage: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$production_damage_status", 1] },
                { $eq: ["$damage_status", 1] },
                { $eq: ["$collect_damage_status", 1] },
              ],
            },
            1, 0,
          ],
        },
      },
    },
  },
  {
    // Add a readable month label e.g. "2025-03"
    $addFields: {
      monthLabel: {
        $concat: [
          { $toString: "$_id.year" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.month", 10] },
              { $concat: ["0", { $toString: "$_id.month" }] },
              { $toString: "$_id.month" },
            ],
          },
        ],
      },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
]);


    const totalPanels = totalPanelsProduced || 1;
    const summary = {
      productionRate: Number(((totalProduction / totalPanels) * 100).toFixed(1)),
      dispatchRate: totalProduction
        ? Number(((totalDispatched / totalProduction) * 100).toFixed(1))
        : 0,
      receiveRate: totalDispatched
        ? Number(((dispatchedAndCollected / totalDispatched) * 100).toFixed(1))
        : 0,
      damageRate: Number(((totalDamage / totalPanels) * 100).toFixed(1)),
      pendingDispatch: Math.max(totalProduction - totalDispatched - productionDamaged, 0),
    };

    const pipeline = [
      { key: "generated", label: "Generated", value: totalPanelsProduced },
      { key: "produced", label: "Produced", value: totalProduction },
      { key: "inStock", label: "In Stock", value: inStock },
      { key: "dispatched", label: "Dispatched", value: totalDispatched },
      { key: "received", label: "Received", value: dispatchedAndCollected },
      { key: "damaged", label: "Damaged", value: totalDamage },
    ];

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      data: {
        stock: {
          totalPanelsProduced,
          inStock,
          pendingProduction,
          onHold,
          readyToDispatch,
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
          safePanelsReceived,
        },
        damage: {
          productionDamaged,
          dispatchedDamaged,
          dispatchedAndCollectedDamaged,
          totalDamage,
        },
        summary,
        pipeline,
        panelCapacityWise,
        panelPrefixWise,
        monthWiseData,
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Dashboard fetch failed" });
  }
};