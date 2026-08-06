const extractPrefixFromSerial = (serial) => {
  if (!serial) return "";
  const match = String(serial).trim().match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : "";
};

const PrefixCell = ({ value, serial }) => (
  <span className="klk-prefix-cell">
    {value || extractPrefixFromSerial(serial) || "—"}
  </span>
);

export default PrefixCell;
