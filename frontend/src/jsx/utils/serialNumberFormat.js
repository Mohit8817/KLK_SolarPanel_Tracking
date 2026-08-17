export const SERIAL_FORMAT_PARTS = [
  { id: "prefix", label: "Prefix", sample: "KLK" },
  { id: "capacity", label: "Capacity", sample: "550" },
  { id: "type", label: "Panel Type", sample: "1" },
  { id: "month_year", label: "Month & Year", sample: "0825" },
  { id: "sequence", label: "Sequence No", sample: "000001", locked: true },
];

export const DEFAULT_SERIAL_FORMAT = [
  "prefix",
  "capacity",
  "type",
  "month_year",
  "sequence",
];

export const ALLOWED_SEQUENCE_DIGITS = [3, 5, 6, 7];
export const DEFAULT_SEQUENCE_DIGITS = 6;

export const ALLOWED_CAPACITY_DIGITS = [2, 3];
export const DEFAULT_CAPACITY_DIGITS = 3;

export const normalizeSequenceDigits = (digits) => {
  const value = Number(digits);
  return ALLOWED_SEQUENCE_DIGITS.includes(value)
    ? value
    : DEFAULT_SEQUENCE_DIGITS;
};

export const normalizeCapacityDigits = (digits) => {
  const value = Number(digits);
  return ALLOWED_CAPACITY_DIGITS.includes(value)
    ? value
    : DEFAULT_CAPACITY_DIGITS;
};

export const formatCapacityForSerial = (
  capacity,
  digits = DEFAULT_CAPACITY_DIGITS
) => {
  const raw = String(capacity ?? "")
    .trim()
    .replace(/[^\d]/g, "");
  if (!raw) return "";

  const width = normalizeCapacityDigits(digits);
  if (raw.length > width) return raw.slice(-width);
  return raw.padStart(width, "0");
};

export const padSequence = (sequence, digits = DEFAULT_SEQUENCE_DIGITS) =>
  String(sequence).padStart(normalizeSequenceDigits(digits), "0");

export const normalizeSerialFormat = (format) => {
  if (!Array.isArray(format) || format.length === 0) {
    return [...DEFAULT_SERIAL_FORMAT];
  }

  const validIds = SERIAL_FORMAT_PARTS.map((p) => p.id);
  const enabled = format.filter(
    (part) => validIds.includes(part) && part !== "sequence"
  );

  return [...enabled, "sequence"];
};

export const getMonthYearFromDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const yearShort = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${month}${yearShort}`;
};

export const buildSerialPartValues = ({
  prefix = "",
  panel_capacity = "",
  panel_type = "",
  date = "",
  sequence = 1,
  sequence_digits = DEFAULT_SEQUENCE_DIGITS,
  capacity_digits = DEFAULT_CAPACITY_DIGITS,
}) => ({
  prefix: String(prefix || "").trim(),
  capacity: formatCapacityForSerial(panel_capacity, capacity_digits),
  type: String(panel_type || "").trim(),
  month_year: getMonthYearFromDate(date),
  sequence: padSequence(sequence, sequence_digits),
});

export const buildSerialNumber = (format, partValues) =>
  normalizeSerialFormat(format)
    .map((part) => partValues[part] ?? "")
    .join("");

export const buildSerialPreview = ({
  format,
  formData,
  startingNo = 1,
  totalPanels = 1,
  sequenceDigits = DEFAULT_SEQUENCE_DIGITS,
  capacityDigits = DEFAULT_CAPACITY_DIGITS,
}) => {
  const normalized = normalizeSerialFormat(format);
  const digits = normalizeSequenceDigits(sequenceDigits);
  const capDigits = normalizeCapacityDigits(capacityDigits);
  const endNo = startingNo + Math.max(Number(totalPanels) || 1, 1) - 1;

  const buildValues = (sequence) =>
    buildSerialPartValues({
      ...formData,
      sequence,
      sequence_digits: digits,
      capacity_digits: capDigits,
    });

  const first = buildSerialNumber(normalized, buildValues(startingNo));

  const second =
    Number(totalPanels) > 1
      ? buildSerialNumber(normalized, buildValues(startingNo + 1))
      : null;

  const last =
    Number(totalPanels) > 1
      ? buildSerialNumber(normalized, buildValues(endNo))
      : null;

  return { first, second, last, normalized, sequenceDigits: digits, capacityDigits: capDigits };
};
