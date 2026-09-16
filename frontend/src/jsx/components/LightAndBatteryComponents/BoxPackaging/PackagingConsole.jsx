import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card, Form, Button, Badge, ProgressBar, Alert, Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageHeader from "../../Common/PageHeader";
import PrintBoxLabel from "./PrintBoxLabel";

const MAX_BOX_CAPACITY = 20;

const makeBoxId = () => "BOX-" + Date.now().toString().slice(-6);

const DEFAULT_ITEMS = [
  { id: 1, serialNo: "SL24090001", type: "LIGHT", model: "20W Solar Street Light", qcStatus: "PASSED", time: "12:30 PM" },
  { id: 2, serialNo: "BAT24090001", type: "BATTERY", model: "12.8V 30Ah Battery Pack", qcStatus: "PASSED", time: "12:32 PM" },
];

const makeBox = (project, items = []) => ({
  boxId: makeBoxId(),
  project,
  items,
  status: "OPEN", // OPEN | SEALED
  expanded: true,
  sealedAt: null,
});

// ── Item type visual config — used everywhere an item type needs an icon/color ──
const TYPE_META = {
  LIGHT: { label: "Solar Light", icon: "fa-solar-panel", color: "#2563EB", tint: "#EFF4FF" },
  BATTERY: { label: "Battery", icon: "fa-car-battery", color: "#0EA5A5", tint: "#EAFBFA" },
};

const TypeIcon = ({ type, size = 28 }) => {
  const meta = TYPE_META[type];
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
      style={{ width: size, height: size, background: meta.tint, color: meta.color }}
    >
      <i className={`fa-solid ${meta.icon}`} style={{ fontSize: size * 0.46 }}></i>
    </span>
  );
};

const PackagingConsole = () => {
  const [destinationProject, setDestinationProject] = useState("Rajasthan Smart Highway Project");
  const [boxes, setBoxes] = useState(() => [makeBox("Rajasthan Smart Highway Project", DEFAULT_ITEMS)]);
  const [scannedSerial, setScannedSerial] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sealingBoxId, setSealingBoxId] = useState(null); // which box the print modal is for

  const inputRef = useRef(null);

  // The box currently receiving scans is always the most recent OPEN box.
  const activeBox = useMemo(() => [...boxes].reverse().find((b) => b.status === "OPEN") || null, [boxes]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [boxes.length, activeBox?.items.length]);

  const updateBox = (boxId, updater) => {
    setBoxes((prev) => prev.map((b) => (b.boxId === boxId ? { ...b, ...updater(b) } : b)));
  };

  const toggleExpand = (boxId) => {
    updateBox(boxId, (b) => ({ expanded: !b.expanded }));
  };

  const availableQCSuggestions = useMemo(() => {
    const packedSet = new Set(boxes.flatMap((b) => b.items.map((i) => i.serialNo)));
    try {
      const savedQC = localStorage.getItem("klk_qc_records");
      if (savedQC) {
        const list = JSON.parse(savedQC);
        return list.filter((q) => q.status === "PASSED" && !packedSet.has(q.serialNo)).slice(0, 4);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { serialNo: "SL24090005", type: "LIGHT" },
      { serialNo: "SL24090006", type: "LIGHT" },
      { serialNo: "BAT24090003", type: "BATTERY" },
    ];
  }, [boxes]);

  const startNewBox = useCallback(
    (project) => {
      const box = makeBox(project ?? destinationProject);
      setBoxes((prev) => [...prev.map((b) => ({ ...b, expanded: false })), box]);
      return box;
    },
    [destinationProject]
  );

  const handlePackItem = (overrideSerial) => {
    setErrorMessage("");
    setSuccessMessage("");

    const serial = (overrideSerial || scannedSerial).trim().toUpperCase();
    if (!serial) {
      setErrorMessage("Pehle Serial Number scan ya enter karein!");
      inputRef.current?.focus();
      return;
    }

    const box = activeBox ?? startNewBox();

    if (box.items.some((i) => i.serialNo === serial)) {
      setErrorMessage(`DUPLICATE: Serial (${serial}) iss box me already pack hai!`);
      return;
    }

    try {
      const savedQC = localStorage.getItem("klk_qc_records");
      if (savedQC) {
        const record = JSON.parse(savedQC).find((q) => q.serialNo === serial);
        if (record && record.status !== "PASSED") {
          setErrorMessage(`QC ALERT: Unit (${serial}) "${record.status}" hai (${record.defectReason || "Failed inspection"})! Sirf QC Passed units pack ho sakti hain.`);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (serial.includes("FAIL") || serial === "SL24090002") {
      setErrorMessage(`QC ALERT: Unit (${serial}) Quality Check me REJECT hui hai!`);
      return;
    }

    const isBattery = serial.startsWith("BAT") || serial.startsWith("B-");
    const newItem = {
      id: Date.now(),
      serialNo: serial,
      type: isBattery ? "BATTERY" : "LIGHT",
      model: isBattery ? "12.8V 30Ah Battery Pack" : "20W Solar Street Light",
      qcStatus: "PASSED",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedItems = [newItem, ...box.items];
    const willBeFull = updatedItems.length >= MAX_BOX_CAPACITY;

    updateBox(box.boxId, () => ({ items: updatedItems, expanded: true }));
    setScannedSerial("");
    setSuccessMessage(
      willBeFull
        ? `Unit "${serial}" pack ho gayi — ${box.boxId} ab FULL hai (${updatedItems.length}/${MAX_BOX_CAPACITY}). Seal ho raha hai...`
        : `Unit "${serial}" successfully packed in ${box.boxId}! (${updatedItems.length}/${MAX_BOX_CAPACITY})`
    );

    // Auto-seal the moment the box reaches full capacity.
    if (willBeFull) {
      setTimeout(() => setSealingBoxId(box.boxId), 400);
    }

    inputRef.current?.focus();
  };

  const handleUndo = (boxId) => {
    const box = boxes.find((b) => b.boxId === boxId);
    if (!box || box.items.length === 0) return;
    const [removed, ...rest] = box.items;
    updateBox(boxId, () => ({ items: rest }));
    setSuccessMessage(`Last item "${removed.serialNo}" box se remove kar diya gaya hai.`);
  };

  const handleRemoveItem = (boxId, itemId) => {
    updateBox(boxId, (b) => ({ items: b.items.filter((i) => i.id !== itemId) }));
  };

  const handleSealBox = (boxId) => {
    const box = boxes.find((b) => b.boxId === boxId);
    if (!box || box.items.length === 0) {
      setErrorMessage("Box empty hai! At least 1 unit pack karein.");
      return;
    }
    setSealingBoxId(boxId);
  };

  const handleBoxSealed = () => {
    const boxId = sealingBoxId;
    updateBox(boxId, () => ({ status: "SEALED", sealedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), expanded: false }));
    setSealingBoxId(null);
    startNewBox();
    setSuccessMessage("Box seal ho gaya. Naya box shuru kar diya gaya hai — scanning karein!");
  };

  const sealingBox = boxes.find((b) => b.boxId === sealingBoxId) || null;
  const isActiveFull = (activeBox?.items.length ?? 0) >= MAX_BOX_CAPACITY;

  return (
    <div className="packaging-console-page pb-4">
      <PageHeader
        title="Box Packaging Console"
        subtitle="QC Passed Lights aur Batteries ko Box me pack karein (Maximum 20 Units per Box)"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Packaging" },
          { label: "Box Packaging Console" },
        ]}
        action={
          <div className="d-flex align-items-center gap-2">
            <Link to="/light/qc/inspection" className="btn btn-outline-primary btn-sm">
              <i className="fa-solid fa-clipboard-check me-1"></i> QC Console
            </Link>
            <Link to="/light/box/list" className="btn btn-outline-secondary btn-sm">
              <i className="fa-solid fa-list me-1"></i> Sealed Boxes Directory
            </Link>
          </div>
        }
      />

      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage("")} className="d-flex align-items-center py-2 px-3 fs-13 mb-3">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          <span>{errorMessage}</span>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="d-flex align-items-center py-2 px-3 fs-13 mb-3">
          <i className="fa-solid fa-circle-check me-2"></i>
          <span>{successMessage}</span>
        </Alert>
      )}

      {/* ── SCANNER BAR — always targets the current open box ── */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fs-12 fw-bold text-muted text-uppercase-none">Scanning into</span>
              <Badge bg="dark" className="fs-13 font-monospace py-2 px-3">
                {activeBox ? activeBox.boxId : "—"}
              </Badge>
              {activeBox && (
                <span className="fs-12 text-muted">
                  {activeBox.items.length}/{MAX_BOX_CAPACITY} units
                </span>
              )}
            </div>
            <Form.Select
              size="sm"
              value={destinationProject}
              onChange={(e) => setDestinationProject(e.target.value)}
              style={{ width: "230px" }}
            >
              <option value="Rajasthan Smart Highway Project">Rajasthan Smart Highway</option>
              <option value="UP Rural Solar Grid">UP Rural Solar Grid</option>
              <option value="MP Urban Streetlight">MP Urban Streetlight</option>
              <option value="Gujarat Industrial Park">Gujarat Industrial Park</option>
            </Form.Select>
          </div>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handlePackItem();
            }}
          >
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa-solid fa-barcode text-primary fs-4"></i>
              </span>
              <Form.Control
                ref={inputRef}
                type="text"
                placeholder={
                  isActiveFull
                    ? "Box seal ho raha hai — thoda ruken..."
                    : "Scan Barcode Gun ya type serial (e.g. SL24090005, BAT24090005)..."
                }
                value={scannedSerial}
                onChange={(e) => setScannedSerial(e.target.value)}
                disabled={isActiveFull}
                className="border-start-0 font-monospace fw-bold fs-15 bg-white"
                autoFocus
              />
              <Button type="submit" variant="primary" className="px-4 fw-bold" disabled={isActiveFull || !scannedSerial.trim()}>
                <i className="fa-solid fa-plus me-1"></i> Pack
              </Button>
            </div>

            {availableQCSuggestions.length > 0 && !isActiveFull && (
              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                <span className="fs-11 text-muted text-nowrap">Quick add — QC Passed:</span>
                <div className="d-flex gap-2 flex-wrap">
                  {availableQCSuggestions.map((s) => (
                    <Button
                      key={s.serialNo}
                      variant="outline-secondary"
                      size="sm"
                      className="py-1 px-2 font-monospace fs-11 bg-white"
                      type="button"
                      onClick={() => handlePackItem(s.serialNo)}
                    >
                      + {s.serialNo}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* ── BOX ROW — each box is its own collapsible card, newest first ── */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h5 className="mb-0 fw-bold fs-14 text-dark">
          Today&apos;s Boxes <span className="text-muted fw-normal">({boxes.length})</span>
        </h5>
      </div>

      <div className="d-flex flex-wrap gap-3">
        {[...boxes].reverse().map((box) => {
          const count = box.items.length;
          const pct = Math.round((count / MAX_BOX_CAPACITY) * 100);
          const lights = box.items.filter((i) => i.type === "LIGHT").length;
          const batteries = box.items.filter((i) => i.type === "BATTERY").length;
          const isSealed = box.status === "SEALED";

          return (
            <Card key={box.boxId} className="border-0 shadow-sm" style={{ width: "300px" }}>
              <Card.Body
                className="p-3 pb-2"
                role="button"
                onClick={() => toggleExpand(box.boxId)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="font-monospace fw-bold fs-14 text-dark">{box.boxId}</span>
                      {isSealed ? (
                        <Badge bg="success" className="fs-10">
                          <i className="fa-solid fa-lock me-1"></i> Sealed
                        </Badge>
                      ) : (
                        <Badge bg="primary" className="fs-10">
                          <i className="fa-solid fa-lock-open me-1"></i> Open
                        </Badge>
                      )}
                    </div>
                    <div className="fs-11 text-muted">{box.project}</div>
                  </div>
                  <i className={`fa-solid fa-chevron-${box.expanded ? "up" : "down"} text-muted mt-1`}></i>
                </div>

                <ProgressBar
                  now={pct}
                  variant={isSealed ? "success" : pct >= 100 ? "success" : pct >= 75 ? "warning" : "primary"}
                  style={{ height: "6px" }}
                  className="rounded-pill mb-2"
                />

                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-11 text-muted d-flex align-items-center gap-1">
                      <i className="fa-solid fa-solar-panel" style={{ color: TYPE_META.LIGHT.color }}></i> {lights}
                    </span>
                    <span className="fs-11 text-muted d-flex align-items-center gap-1">
                      <i className="fa-solid fa-car-battery" style={{ color: TYPE_META.BATTERY.color }}></i> {batteries}
                    </span>
                  </div>
                  <span className="fs-12 fw-bold text-dark">
                    {count}/{MAX_BOX_CAPACITY}
                  </span>
                </div>
              </Card.Body>

              <Collapse in={box.expanded}>
                <div>
                  <div className="border-top">
                    <div
                      className="px-3 py-2"
                      style={{ maxHeight: "260px", overflowY: "auto" }}
                    >
                      {box.items.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <i className="fa-solid fa-box-open fs-20 d-block mb-1 opacity-50"></i>
                          <span className="fs-12">Abhi koi unit pack nahi hui</span>
                        </div>
                      ) : (
                        box.items.map((item) => (
                          <div key={item.id} className="d-flex align-items-center gap-2 py-2 border-bottom">
                            <TypeIcon type={item.type} size={26} />
                            <div className="flex-grow-1 min-w-0">
                              <div className="fs-12 fw-bold font-monospace text-dark text-truncate">{item.serialNo}</div>
                              <div className="fs-10 text-muted">
                                {TYPE_META[item.type].label} &middot; {item.time}
                              </div>
                            </div>
                            {!isSealed && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(box.boxId, item.id);
                                }}
                                title="Remove from box"
                              >
                                <i className="fa-solid fa-trash fs-12"></i>
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {!isSealed && (
                      <div className="d-flex gap-2 p-2 border-top bg-light-subtle">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="flex-fill fs-12"
                          disabled={box.items.length === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndo(box.boxId);
                          }}
                        >
                          <i className="fa-solid fa-rotate-left me-1"></i> Undo
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-fill fs-12 fw-bold"
                          disabled={box.items.length === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSealBox(box.boxId);
                          }}
                        >
                          <i className="fa-solid fa-box-archive me-1"></i> Seal Now
                        </Button>
                      </div>
                    )}

                    {isSealed && (
                      <div className="p-2 border-top bg-light-subtle fs-11 text-muted text-center">
                        Sealed at {box.sealedAt}
                      </div>
                    )}
                  </div>
                </div>
              </Collapse>
            </Card>
          );
        })}
      </div>

      {sealingBox && (
        <PrintBoxLabel
          show={!!sealingBox}
          onHide={() => setSealingBoxId(null)}
          boxData={{
            boxId: sealingBox.boxId,
            totalCount: sealingBox.items.length,
            lightsCount: sealingBox.items.filter((i) => i.type === "LIGHT").length,
            batteriesCount: sealingBox.items.filter((i) => i.type === "BATTERY").length,
            grossWeight: (
              sealingBox.items.filter((i) => i.type === "LIGHT").length * 4.5 +
              sealingBox.items.filter((i) => i.type === "BATTERY").length * 3.2 +
              1.8
            ).toFixed(1),
            project: sealingBox.project,
            items: sealingBox.items,
          }}
          onBoxSealed={handleBoxSealed}
        />
      )}
    </div>
  );
};

export default PackagingConsole;