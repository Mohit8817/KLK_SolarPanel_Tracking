import mongoose from "mongoose";
import PanelSerialLot from "../models/PanelSerialLot.model.js";
import PanelNumber from "../models/PanelNumber.model.js";
import PanelCounter from "../models/PanelCounter.model.js";
import {
  buildSerialNumber,
  buildSerialNumberParts,
  normalizeSerialFormat,
  normalizeSequenceDigits,
  DEFAULT_SERIAL_FORMAT,
  DEFAULT_SEQUENCE_DIGITS,
  padSequence,
  formatsEqual,
  formatSerialFormatLabel,
  inferSerialFormatFromUniqueNo,
  serialFormatMatchesUniqueNo,
} from "../utils/serialNumberFormat.js";

const getCounterKey = (prefix, panel_capacity, panel_type, year) => ({
  prefix: String(prefix).trim(),
  panel_capacity: String(panel_capacity).trim(),
  panel_type: String(panel_type).trim(),
  year: String(year).trim(),
});

/** Resolve sequence digits and serial format from existing counter/lots/panels. */
const resolveHistoricalSeriesConfig = async (
  prefix,
  panel_capacity,
  panel_type,
  year
) => {
  const key = getCounterKey(prefix, panel_capacity, panel_type, year);
  const counter = await PanelCounter.findOne(key).lean();

  if (!counter || counter.seq <= 0) {
    return {
      sequence_digits: DEFAULT_SEQUENCE_DIGITS,
      serial_format: [...DEFAULT_SERIAL_FORMAT],
      has_history: false,
      locked: false,
    };
  }

  let sequence_digits = counter.sequence_digits
    ? normalizeSequenceDigits(counter.sequence_digits)
    : null;

  let serial_format = Array.isArray(counter.serial_format) &&
    counter.serial_format.length
    ? normalizeSerialFormat(counter.serial_format)
    : null;

  let lotDate = null;

  if (counter.last_lot_id) {
    const lastLot = await PanelSerialLot.findById(counter.last_lot_id)
      .select("sequence_digits serial_format date")
      .lean();

    if (lastLot) {
      lotDate = lastLot.date || lotDate;

      if (!sequence_digits && lastLot.sequence_digits) {
        sequence_digits = normalizeSequenceDigits(lastLot.sequence_digits);
      }

      if (
        Array.isArray(lastLot.serial_format) &&
        lastLot.serial_format.length
      ) {
        serial_format = normalizeSerialFormat(lastLot.serial_format);
      }
    }
  }

  const samplePanel = await PanelNumber.findOne({
    prefix: key.prefix,
    panel_capacity: key.panel_capacity,
    panel_type: key.panel_type,
    generated_year: year,
  })
    .sort({ panel_no: 1 })
    .select("panel_unique_no panel_no panel_lot_id")
    .lean();

  if (samplePanel) {
    if (!lotDate && samplePanel.panel_lot_id) {
      const sampleLot = await PanelSerialLot.findById(samplePanel.panel_lot_id)
        .select("date sequence_digits serial_format")
        .lean();

      if (sampleLot) {
        lotDate = sampleLot.date || lotDate;

        if (!sequence_digits && sampleLot.sequence_digits) {
          sequence_digits = normalizeSequenceDigits(sampleLot.sequence_digits);
        }

        if (
          !serial_format &&
          Array.isArray(sampleLot.serial_format) &&
          sampleLot.serial_format.length
        ) {
          serial_format = normalizeSerialFormat(sampleLot.serial_format);
        }
      }
    }

    if (!sequence_digits) {
      sequence_digits = DEFAULT_SEQUENCE_DIGITS;
    }

    const inferenceInput = {
      panel_unique_no: samplePanel.panel_unique_no,
      prefix: key.prefix,
      panel_capacity: key.panel_capacity,
      panel_type: key.panel_type,
      date: lotDate || `${year}-01-01`,
      panel_no: samplePanel.panel_no,
      sequence_digits,
    };

    if (
      serial_format &&
      serialFormatMatchesUniqueNo(serial_format, inferenceInput)
    ) {
      serial_format = normalizeSerialFormat(serial_format);
    } else {
      serial_format = inferSerialFormatFromUniqueNo(inferenceInput);
    }
  }

  if (!sequence_digits) {
    sequence_digits = DEFAULT_SEQUENCE_DIGITS;
  }
  if (!serial_format) {
    serial_format = [...DEFAULT_SERIAL_FORMAT];
  }

  const counterDoc = await PanelCounter.findOne(key);
  if (counterDoc) {
    let needsSave = false;

    if (counterDoc.sequence_digits !== sequence_digits) {
      counterDoc.sequence_digits = sequence_digits;
      needsSave = true;
    }

    const storedFormat = Array.isArray(counterDoc.serial_format)
      ? normalizeSerialFormat(counterDoc.serial_format)
      : null;

    if (!storedFormat || !formatsEqual(storedFormat, serial_format)) {
      counterDoc.serial_format = serial_format;
      needsSave = true;
    }

    if (needsSave) {
      await counterDoc.save();
    }
  }

  return {
    sequence_digits,
    serial_format,
    has_history: true,
    locked: true,
    last_sequence: counter.seq,
  };
};

export const getNextPanelNumber = async (req, res) => {
  try {
    const { prefix, panel_type, panel_capacity, date } = req.body;

    if (!prefix || !panel_type || !panel_capacity || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const year = new Date(date).getFullYear().toString();
    const key = getCounterKey(prefix, panel_capacity, panel_type, year);
    const counter = await PanelCounter.findOne(key);
    const history = await resolveHistoricalSeriesConfig(
      prefix,
      panel_capacity,
      panel_type,
      year
    );

    let nextNumber = 1;

    if (counter) {
      nextNumber = counter.seq + 1;
    }

    return res.status(200).json({
      success: true,
      next_starting_no: nextNumber,
      sequence_digits: history.sequence_digits,
      serial_format: history.serial_format,
      has_history: history.has_history,
      sequence_digits_locked: history.locked,
      serial_format_locked: history.locked,
      history_message: history.has_history
        ? `Existing panels for this prefix/capacity/type/${year} use ${history.sequence_digits}-digit sequence and format: ${formatSerialFormatLabel(history.serial_format)}. Next: ${padSequence(nextNumber, history.sequence_digits)}`
        : null,
    });
  } catch (error) {
    return res.status(400).json({
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
      company_id,
      created_by,
      updated_by,
      serial_format,
      sequence_digits,
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

    if (totalPanelsNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total panels",
      });
    }

    /* ==========================
       2️⃣ Date Handling
    ========================== */

    const d = new Date(date);

    const yearFull = d.getFullYear().toString();

    const formattedPanelType = String(panel_type).trim();
    const generated_year = yearFull;
    const requestedFormat = normalizeSerialFormat(serial_format);

    const history = await resolveHistoricalSeriesConfig(
      prefix,
      panel_capacity,
      formattedPanelType,
      yearFull
    );

    const requestedDigits = normalizeSequenceDigits(sequence_digits);

    if (history.has_history && requestedDigits !== history.sequence_digits) {
      return res.status(400).json({
        success: false,
        message: `This prefix/capacity/type/${yearFull} already uses ${history.sequence_digits}-digit sequence numbers (last: ${padSequence(history.last_sequence, history.sequence_digits)}). You cannot change to ${requestedDigits} digits for the same series.`,
        sequence_digits: history.sequence_digits,
        has_history: true,
      });
    }

    if (history.has_history && !formatsEqual(requestedFormat, history.serial_format)) {
      return res.status(400).json({
        success: false,
        message: `This prefix/capacity/type/${yearFull} already uses serial format: ${formatSerialFormatLabel(history.serial_format)}. You cannot change the format for the same series.`,
        serial_format: history.serial_format,
        has_history: true,
      });
    }

    const normalizedSequenceDigits = history.has_history
      ? history.sequence_digits
      : requestedDigits;

    const normalizedFormat = history.has_history
      ? history.serial_format
      : requestedFormat;

    /* ==========================
       3️⃣ Atomic Counter Update
    ========================== */

    const counter = await PanelCounter.findOneAndUpdate(
      {
        prefix: String(prefix).trim(),
        panel_capacity: String(panel_capacity).trim(),
        panel_type: formattedPanelType,
        year: yearFull,
      },
      {
        $inc: {
          seq: totalPanelsNum,
        },
        $set: {
          sequence_digits: normalizedSequenceDigits,
          serial_format: normalizedFormat,
        },
        $setOnInsert: {
          last_lot_id: null,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const endingNo = counter.seq;

    const actualStartingNo =
      endingNo - totalPanelsNum + 1;

    /* ==========================
       4️⃣ Create LOT
    ========================== */

    const lot = await PanelSerialLot.create({
      company_id,
      prefix,
      starting_no: actualStartingNo,
      date,
      panel_capacity,
      panel_type: formattedPanelType,
      panel_category,
      panel_alot_state,
      panel_alot_project,
      total_panels: totalPanelsNum,
      serial_format: normalizedFormat,
      sequence_digits: normalizedSequenceDigits,
      created_by,
      updated_by,
    });

    const lotId = lot._id;

    /* ==========================
       5️⃣ Create Panels
    ========================== */

    const panels = [];

    for (let i = 0; i < totalPanelsNum; i++) {
      const serial = actualStartingNo + i;

      const partValues = buildSerialNumberParts({
        prefix,
        panel_capacity,
        panel_type: formattedPanelType,
        date,
        sequence: serial,
        sequence_digits: normalizedSequenceDigits,
      });

      panels.push({
        company_id,

        panel_lot_id: lotId,

        panel_capacity,
        prefix,
        panel_type: formattedPanelType,
        panel_category,

        panel_lot_count: totalPanelsNum,

        panel_no: serial,
        generated_year,

        panel_unique_no: buildSerialNumber(normalizedFormat, partValues),
      });
    }

    await PanelNumber.insertMany(panels);

    /* ==========================
       6️⃣ Update Counter
    ========================== */

    counter.last_lot_id = lotId;

    await counter.save();

    /* ==========================
       7️⃣ Response
    ========================== */

    return res.status(201).json({
      success: true,
      message: "Panel lot created successfully",

      starting_number: actualStartingNo,
      ending_number: endingNo,

      total_created: totalPanelsNum,
      serial_format: normalizedFormat,
      sequence_digits: normalizedSequenceDigits,
      example_serial: buildSerialNumber(
        normalizedFormat,
        buildSerialNumberParts({
          prefix,
          panel_capacity,
          panel_type: formattedPanelType,
          date,
          sequence: actualStartingNo,
          sequence_digits: normalizedSequenceDigits,
        })
      ),
    });
  } catch (error) {
    console.error("Create Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const previewPanelSerialFormat = async (req, res) => {
  try {
    const {
      prefix,
      panel_type,
      panel_capacity,
      date,
      serial_format,
      starting_no = 1,
      total_panels = 1,
      sequence_digits,
    } = req.body;

    const normalizedFormat = normalizeSerialFormat(serial_format || DEFAULT_SERIAL_FORMAT);
    const normalizedSequenceDigits = normalizeSequenceDigits(sequence_digits);
    const start = Number(starting_no) || 1;
    const total = Math.max(Number(total_panels) || 1, 1);
    const end = start + total - 1;

    const buildExample = (sequence) =>
      buildSerialNumber(
        normalizedFormat,
        buildSerialNumberParts({
          prefix,
          panel_capacity,
          panel_type,
          date,
          sequence,
          sequence_digits: normalizedSequenceDigits,
        })
      );

    return res.status(200).json({
      success: true,
      serial_format: normalizedFormat,
      preview: {
        first: buildExample(start),
        second: total > 1 ? buildExample(start + 1) : null,
        last: total > 1 ? buildExample(end) : null,
      },
    });
  } catch (error) {
    return res.status(400).json({
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
      $or: [
        { production_status: 1 },
        { dispatch_status: 1 }
      ],
    });
    if (usedPanel) return res.status(400).json({ success: false, message: "Cannot delete. Panels already used." });

    /* ==========================
       3️⃣ Prepare COUNTER KEY
    ========================== */
    const d = new Date(lot.date);
    const year = d.getFullYear().toString();

    const counter = await PanelCounter.findOne({
      prefix: lot.prefix,
      panel_capacity: lot.panel_capacity,
      panel_type: String(lot.panel_type).trim(),
      year,
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



