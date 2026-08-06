import mongoose from "mongoose";
import PanelNumber from "../models/PanelNumber.model.js";

export async function attachPrefixToRecords(records, linkField) {
  if (!records?.length) return [];

  const plainRecords = records.map((record) =>
    record?.toObject ? record.toObject() : { ...record }
  );

  const ids = plainRecords
    .map((record) => record._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!ids.length) return plainRecords;

  const grouped = await PanelNumber.aggregate([
    { $match: { [linkField]: { $in: ids } } },
    {
      $group: {
        _id: `$${linkField}`,
        prefixes: { $addToSet: "$prefix" },
      },
    },
  ]);

  const prefixMap = grouped.reduce((acc, row) => {
    acc[row._id.toString()] = row.prefixes.filter(Boolean).sort().join(", ");
    return acc;
  }, {});

  return plainRecords.map((record) => ({
    ...record,
    prefix: prefixMap[record._id?.toString?.()] || null,
  }));
}

export async function attachPrefixByPanelUniqueNo(
  records,
  panelNoField = "panel_no"
) {
  if (!records?.length) return [];

  const plainRecords = records.map((record) =>
    record?.toObject ? record.toObject() : { ...record }
  );

  const panelNos = [
    ...new Set(
      plainRecords
        .map((record) => record[panelNoField])
        .filter(Boolean)
    ),
  ];

  if (!panelNos.length) return plainRecords;

  const panels = await PanelNumber.find({
    panel_unique_no: { $in: panelNos },
  }).select("panel_unique_no prefix");

  const prefixMap = panels.reduce((acc, panel) => {
    acc[panel.panel_unique_no] = panel.prefix;
    return acc;
  }, {});

  return plainRecords.map((record) => ({
    ...record,
    prefix: prefixMap[record[panelNoField]] || null,
  }));
}

export async function attachDispatchBreakdown(records) {
  if (!records?.length) return [];

  const plainRecords = records.map((record) =>
    record?.toObject ? record.toObject() : { ...record }
  );

  const ids = plainRecords
    .map((record) => record._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!ids.length) {
    return plainRecords.map((record) => ({
      ...record,
      prefixBreakdown: [],
      capacityBreakdown: [],
      prefix: null,
      capacities: null,
    }));
  }

  const [prefixRows, capacityRows] = await Promise.all([
    PanelNumber.aggregate([
      {
        $match: {
          dispatch_id: { $in: ids },
          prefix: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: { dispatch_id: "$dispatch_id", prefix: "$prefix" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.prefix": 1 } },
    ]),
    PanelNumber.aggregate([
      {
        $match: {
          dispatch_id: { $in: ids },
          panel_capacity: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: { dispatch_id: "$dispatch_id", capacity: "$panel_capacity" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.capacity": 1 } },
    ]),
  ]);

  const prefixByDispatch = {};
  const capacityByDispatch = {};

  prefixRows.forEach((row) => {
    const dispatchId = row._id.dispatch_id.toString();
    if (!prefixByDispatch[dispatchId]) prefixByDispatch[dispatchId] = [];
    prefixByDispatch[dispatchId].push({
      prefix: row._id.prefix,
      count: row.count,
    });
  });

  capacityRows.forEach((row) => {
    const dispatchId = row._id.dispatch_id.toString();
    if (!capacityByDispatch[dispatchId]) capacityByDispatch[dispatchId] = [];
    capacityByDispatch[dispatchId].push({
      capacity: row._id.capacity,
      count: row.count,
    });
  });

  return plainRecords.map((record) => {
    const id = record._id?.toString?.();
    const prefixBreakdown = prefixByDispatch[id] || [];
    const capacityBreakdown = capacityByDispatch[id] || [];

    return {
      ...record,
      prefixBreakdown,
      capacityBreakdown,
      prefix: prefixBreakdown.map((item) => item.prefix).join(", ") || null,
      capacities:
        capacityBreakdown
          .map((item) => `${item.capacity} W (${item.count})`)
          .join(", ") || null,
    };
  });
}
