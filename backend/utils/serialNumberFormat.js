export const SERIAL_PART_IDS = [
  "prefix",
  "capacity",
  "type",
  "month_year",
  "sequence",
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

export const getCapacitySerialVariants = (capacity) => {
  const raw = String(capacity ?? "")
    .trim()
    .replace(/[^\d]/g, "");
  if (!raw) return [""];

  return [
    ...new Set([
      raw,
      formatCapacityForSerial(raw, 2),
      formatCapacityForSerial(raw, 3),
    ]),
  ];
};

export const padSequence = (sequence, digits = DEFAULT_SEQUENCE_DIGITS) =>
  String(sequence).padStart(normalizeSequenceDigits(digits), "0");

export const getSequenceSample = (digits = DEFAULT_SEQUENCE_DIGITS) =>
  padSequence(1, digits);

const PART_LABELS = {
  prefix: "Prefix",
  capacity: "Capacity",
  type: "Panel Type",
  month_year: "Month & Year",
  sequence: "Sequence No",
};

export const getSerialPartLabel = (id) => PART_LABELS[id] || id;

export const normalizeSerialFormat = (format) => {
  if (!Array.isArray(format) || format.length === 0) {
    return [...DEFAULT_SERIAL_FORMAT];
  }

  const valid = format.filter(
    (part) => SERIAL_PART_IDS.includes(part) && part !== "sequence"
  );

  return [...valid, "sequence"];
};

export const formatsEqual = (formatA, formatB) => {
  const a = normalizeSerialFormat(formatA);
  const b = normalizeSerialFormat(formatB);
  return a.length === b.length && a.every((part, index) => part === b[index]);
};

export const formatSerialFormatLabel = (format) =>
  normalizeSerialFormat(format)
    .map((part) => getSerialPartLabel(part))
    .join(" → ");

const OPTIONAL_SERIAL_PARTS = ["prefix", "capacity", "type", "month_year"];

const permutations = (items) => {
  if (items.length <= 1) return [items];

  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (rest) => [item, ...rest]
    )
  );
};

/** Infer which parts were used by matching a stored panel_unique_no. */
export const inferSerialFormatFromUniqueNo = ({
  panel_unique_no = "",
  prefix = "",
  panel_capacity = "",
  panel_type = "",
  date = "",
  panel_no = 1,
  sequence_digits = DEFAULT_SEQUENCE_DIGITS,
  capacity_digits = DEFAULT_CAPACITY_DIGITS,
}) => {
  const target = String(panel_unique_no).trim();
  if (!target) {
    return [...DEFAULT_SERIAL_FORMAT];
  }

  const capacityVariants = getCapacitySerialVariants(panel_capacity);

  const partCount = OPTIONAL_SERIAL_PARTS.length;
  const subsetCount = 1 << partCount;

  for (let mask = 0; mask < subsetCount; mask += 1) {
    const included = OPTIONAL_SERIAL_PARTS.filter((_, index) => mask & (1 << index));

    for (const order of permutations(included)) {
      const format = [...order, "sequence"];

      for (const capacityValue of capacityVariants) {
        const partValues = {
          ...buildSerialNumberParts({
            prefix,
            panel_capacity,
            panel_type,
            date,
            sequence: panel_no,
            sequence_digits,
            capacity_digits,
          }),
          capacity: capacityValue,
        };

        if (buildSerialNumber(format, partValues) === target) {
          return normalizeSerialFormat(format);
        }
      }
    }
  }

  return [...DEFAULT_SERIAL_FORMAT];
};

export const serialFormatMatchesUniqueNo = (
  format,
  {
    panel_unique_no = "",
    prefix = "",
    panel_capacity = "",
    panel_type = "",
    date = "",
    panel_no = 1,
    sequence_digits = DEFAULT_SEQUENCE_DIGITS,
    capacity_digits = DEFAULT_CAPACITY_DIGITS,
  }
) => {
  const target = String(panel_unique_no).trim();
  if (!target) return false;

  const built = buildSerialNumber(
    format,
    buildSerialNumberParts({
      prefix,
      panel_capacity,
      panel_type,
      date,
      sequence: panel_no,
      sequence_digits,
      capacity_digits,
    })
  );

  return built === target;
};

export const getMonthYearFromDate = (date) => {
  const d = new Date(date);
  const yearShort = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${month}${yearShort}`;
};

export const buildSerialNumberParts = ({
  prefix = "",
  panel_capacity = "",
  panel_type = "",
  date = "",
  sequence = 1,
  sequence_digits = DEFAULT_SEQUENCE_DIGITS,
  capacity_digits = DEFAULT_CAPACITY_DIGITS,
}) => {
  const digits = normalizeSequenceDigits(sequence_digits);

  return {
    prefix: String(prefix || "").trim(),
    capacity: formatCapacityForSerial(panel_capacity, capacity_digits),
    type: String(panel_type || "").trim(),
    month_year: date ? getMonthYearFromDate(date) : "",
    sequence: padSequence(sequence, digits),
  };
};

export const buildSerialNumber = (format, partValues) => {
  const normalized = normalizeSerialFormat(format);

  return normalized
    .map((part) => partValues[part] ?? "")
    .join("");
};
