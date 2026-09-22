import "./PackagingAnimation.css";
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

// A box now starts life as a "pending" shell created the moment its
// Box ID is scanned. It only becomes a real packable box (status OPEN)
// once the Box Scan step succeeds.
const makeBox = (project, items = [], boxId = null) => ({
  boxId: boxId || makeBoxId(),
  project,
  items,
  status: "OPEN", // OPEN | SEALED
  expanded: true,
  sealedAt: null,
});

// ── Item type visual configuration ──
const TYPE_META = {
  LIGHT: { label: "Solar Light", icon: "fa-lightbulb", color: "#2563EB", tint: "#EFF4FF" },
  BATTERY: { label: "Battery", icon: "fa-car-battery", color: "#0EA5A5", tint: "#EAFBFA" },
};

const CONTAINER_CAPACITY = 12; // Maximum sealed boxes per container

// Fixed dimensions used ONLY for the flying ghost card — kept constant
// regardless of how many items the real box holds, so the animation
// never "jumps" upward when a box is heavily packed.
const FLIGHT_WIDTH = 260;
const FLIGHT_HEIGHT = 92;

// Max height (px) for the scrollable icon-tile grid inside an open box
const ITEM_GRID_MAX_HEIGHT = 380;

// Max height (px) for the scrollable container grid
const CONTAINER_MAX_HEIGHT = 480;

/* ── Small icon tile for a single packed item (Light / Battery) ──
   This is the "icon inside the box" look — a compact square/rect
   tile showing the type icon + short serial, matching the packed
   drawing (grid of small light/battery symbols inside an open box). */
const ItemIconTile = ({ item, onRemove }) => {
  const meta = TYPE_META[item.type];
  return (
    <div className="item-icon-tile position-relative" title={`${item.serialNo} · ${item.time}`}>
      <button
        type="button"
        className="item-icon-tile__remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        title="Remove from box"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
      <div className="item-icon-tile__box d-flex flex-column align-items-center bg-white rounded-3">
        <div
          className="item-icon-tile__circle d-flex align-items-center justify-content-center rounded-circle"
          style={{ background: meta.tint }}
        >
          <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }}></i>
        </div>
        <span className="fs-11 fw-bold font-monospace text-dark text-truncate px-1 mt-2" style={{ maxWidth: "100%" }}>
          {item.serialNo}
        </span>
      </div>
    </div>
  );
};

/* ── Small sealed-box tile shown inside the container ── */
const SealedBoxTile = ({ box, landing }) => {
  const lights = box.items.filter((i) => i.type === "LIGHT").length;
  const batteries = box.items.filter((i) => i.type === "BATTERY").length;
  return (
    <div className={`sealed-box-tile position-relative bg-white rounded-4 p-3 ${landing ? "sealed-tile--landing" : ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="font-monospace fw-bold fs-13 text-dark">{box.boxId}</span>
        <span className="sealed-box-tile__badge d-inline-flex align-items-center gap-1">
          <i className="fa-solid fa-lock fs-10"></i> Sealed
        </span>
      </div>
      <div className="fs-11 text-muted text-truncate mb-3">
        <i className="fa-solid fa-location-dot me-1"></i>
        {box.project}
      </div>
      <div className="d-flex align-items-center justify-content-between">
        <span className="d-flex align-items-center gap-3 fs-12 text-muted">
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-lightbulb text-primary"></i>
            {lights}
          </span>
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-car-battery text-info"></i>
            {batteries}
          </span>
        </span>
        <span className="sealed-box-tile__count">{box.items.length} units</span>
      </div>
    </div>
  );
};

const PackagingConsole = () => {
  const [destinationProject, setDestinationProject] = useState("Rajasthan Smart Highway Project");
  const [boxes, setBoxes] = useState(() => [makeBox("Rajasthan Smart Highway Project", DEFAULT_ITEMS)]);

  // ── STEP 1: Box scan input (must happen before any item can be packed) ──
  const [boxScanValue, setBoxScanValue] = useState("");

  // ── STEP 2: Item scan input (only enabled once a box is open) ──
  const [scannedSerial, setScannedSerial] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sealingBoxId, setSealingBoxId] = useState(null); // Box currently selected for the print modal

  // ── Animation state: box currently flying from left to right ──
  const [flight, setFlight] = useState(null); // { box, from:{top,left,width,height}, to:{...}, phase }
  const [justLandedId, setJustLandedId] = useState(null);

  const boxScanInputRef = useRef(null);
  const itemScanInputRef = useRef(null);
  const openBoxRef = useRef(null);
  const containerSlotRef = useRef(null);

  // The box currently receiving scans is always the most recent OPEN box.
  const activeBox = useMemo(() => [...boxes].reverse().find((b) => b.status === "OPEN") || null, [boxes]);
  const sealedBoxes = useMemo(() => boxes.filter((b) => b.status === "SEALED"), [boxes]);

  // Hide the box from the container grid while it is flying
  const visibleSealed = useMemo(
    () => sealedBoxes.filter((b) => b.boxId !== flight?.box.boxId),
    [sealedBoxes, flight]
  );

  // Focus whichever input is relevant to the current step
  useEffect(() => {
    if (!activeBox) {
      boxScanInputRef.current?.focus();
    } else {
      itemScanInputRef.current?.focus();
    }
  }, [activeBox, activeBox?.items.length]);

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

  /* ── STEP 1: Scan / open a box ──
     Nothing can be packed until a Box ID is scanned here. If the person
     leaves the field blank and just presses the button, we still create
     a box with an auto-generated ID (useful when there's no separate
     printed box barcode yet). */
  const handleScanBox = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (activeBox) return; // a box is already open, nothing to do

    const rawId = boxScanValue.trim().toUpperCase();

    if (rawId && boxes.some((b) => b.boxId === rawId)) {
      setErrorMessage(`Box ID (${rawId}) already exists! Scan a different box.`);
      return;
    }

    const box = makeBox(destinationProject, [], rawId || undefined);
    setBoxes((prev) => [...prev.map((b) => ({ ...b, expanded: false })), box]);
    setBoxScanValue("");
    setSuccessMessage(`Box ${box.boxId} is now OPEN — start scanning Lights / Batteries.`);
  };

  const startNewBox = useCallback(
    (project) => {
      const box = makeBox(project ?? destinationProject);
      setBoxes((prev) => [...prev.map((b) => ({ ...b, expanded: false })), box]);
      return box;
    },
    [destinationProject]
  );

  /* ── STEP 2: Scan an item into the currently open box ── */
  const handlePackItem = (overrideSerial) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!activeBox) {
      setErrorMessage("Pehle Box ID scan karo — box open hone ke baad hi items pack ho sakte hain!");
      boxScanInputRef.current?.focus();
      return;
    }

    const serial = (overrideSerial || scannedSerial).trim().toUpperCase();
    if (!serial) {
      setErrorMessage("Please scan or enter a Serial Number first!");
      itemScanInputRef.current?.focus();
      return;
    }

    const box = activeBox;

    if (box.items.some((i) => i.serialNo === serial)) {
      setErrorMessage(`DUPLICATE: Serial (${serial}) iss box me already pack hai!`);
      return;
    }

    try {
      const savedQC = localStorage.getItem("klk_qc_records");
      if (savedQC) {
        const record = JSON.parse(savedQC).find((q) => q.serialNo === serial);
        if (record && record.status !== "PASSED") {
          setErrorMessage(`QC ALERT: Unit (${serial}) has status "${record.status}" (${record.defectReason || "Failed inspection"})! Only QC Passed units can be packed.`);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (serial.includes("FAIL") || serial === "SL24090002") {
      setErrorMessage(`QC ALERT: Unit (${serial}) was REJECTED during Quality Check!`);
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
        ? `Unit "${serial}" packed — ${box.boxId} is now FULL (${updatedItems.length}/${MAX_BOX_CAPACITY}). Sealing...`
        : `Unit "${serial}" successfully packed in ${box.boxId}! (${updatedItems.length}/${MAX_BOX_CAPACITY})`
    );

    // Auto-seal the moment the box reaches full capacity.
    if (willBeFull) {
      setTimeout(() => setSealingBoxId(box.boxId), 400);
    }

    itemScanInputRef.current?.focus();
  };

  const handleUndo = (boxId) => {
    const box = boxes.find((b) => b.boxId === boxId);
    if (!box || box.items.length === 0) return;
    const [removed, ...rest] = box.items;
    updateBox(boxId, () => ({ items: rest }));
    setSuccessMessage(`Last item "${removed.serialNo}" has been removed from the box.`);
  };

  const handleRemoveItem = (boxId, itemId) => {
    updateBox(boxId, (b) => ({ items: b.items.filter((i) => i.id !== itemId) }));
  };

  const handleSealBox = (boxId) => {
    const box = boxes.find((b) => b.boxId === boxId);
    if (!box || box.items.length === 0) {
      setErrorMessage("The box is empty! Pack at least 1 unit.");
      return;
    }
    setSealingBoxId(boxId);
  };

  /* ── On seal: play the flight animation, then land in the container ──
     NOTE: the flying ghost card always uses a FIXED size (FLIGHT_WIDTH /
     FLIGHT_HEIGHT), never the real open-box card's rendered height. This
     is what stops the "flies upward" glitch when a box is heavily packed
     and its expanded item list makes the card very tall. */
  const flyBoxToContainer = (box) => {
    const fromEl = openBoxRef.current;
    const toEl = containerSlotRef.current;
    if (!fromEl || !toEl) return false;

    const f = fromEl.getBoundingClientRect();
    const t = toEl.getBoundingClientRect();

    // Anchor the fixed-size ghost to the top-left of the real card so it
    // still visually "departs" from the correct spot, but never inherits
    // the real card's (possibly huge) height/width.
    setFlight({
      box,
      from: { top: f.top, left: f.left, width: FLIGHT_WIDTH, height: FLIGHT_HEIGHT },
      to: { top: t.top, left: t.left, width: t.width, height: t.height },
      phase: "start",
    });

    // Set the target position on the next frame so the CSS transition runs
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlight((fl) => (fl ? { ...fl, phase: "end" } : fl)));
    });

    // Add the tile to the container after the 1.1s transition
    setTimeout(() => {
      setFlight(null);
      setJustLandedId(box.boxId);
      setTimeout(() => setJustLandedId(null), 700);
    }, 1150);

    return true;
  };

  const handleBoxSealed = () => {
    const boxId = sealingBoxId;
    const box = boxes.find((b) => b.boxId === boxId);
    const sealedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Capture the rectangle before the DOM changes because the left card is still visible
    if (box) flyBoxToContainer({ ...box, status: "SEALED", sealedAt });

    updateBox(boxId, () => ({ status: "SEALED", sealedAt, expanded: false }));
    setSealingBoxId(null);
    // NOTE: we no longer auto-start a fresh box here — the next box must
    // be opened explicitly via the Box Scan step, keeping the two-step
    // "scan box → scan items" flow consistent every time.
    setSuccessMessage("Box sealed and moved into the container. Scan the next Box ID to continue!");
  };

  const sealingBox = boxes.find((b) => b.boxId === sealingBoxId) || null;
  const isActiveFull = (activeBox?.items.length ?? 0) >= MAX_BOX_CAPACITY;

  const containerUnits = sealedBoxes.reduce((n, b) => n + b.items.length, 0);

  const renderOpenBox = (box) => {
    const count = box.items.length;
    const pct = Math.round((count / MAX_BOX_CAPACITY) * 100);
    const lightItems = box.items.filter((i) => i.type === "LIGHT");
    const batteryItems = box.items.filter((i) => i.type === "BATTERY");

    return (
      <Card ref={openBoxRef} className="border-0 shadow-sm w-100">
        <Card.Body className="p-3 pb-2" role="button" onClick={() => toggleExpand(box.boxId)}>
          <div className="d-flex align-items-start justify-content-between mb-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="font-monospace fw-bold fs-14 text-dark">{box.boxId}</span>
                <Badge bg="primary" className="fs-10">
                  <i className="fa-solid fa-lock-open me-1"></i> Open
                </Badge>
              </div>
              <div className="fs-11 text-muted">{box.project}</div>
            </div>
            <i className={`fa-solid fa-chevron-${box.expanded ? "up" : "down"} text-muted mt-1`}></i>
          </div>

          <ProgressBar
            now={pct}
            variant={pct >= 100 ? "success" : pct >= 75 ? "warning" : "primary"}
            className="rounded-pill mb-2"
          />

          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="fs-11 text-muted d-flex align-items-center gap-1">
                <i className="fa-solid fa-lightbulb text-primary"></i> {lightItems.length}
              </span>
              <span className="fs-11 text-muted d-flex align-items-center gap-1">
                <i className="fa-solid fa-car-battery text-info"></i> {batteryItems.length}
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
              {/* ── STEP 2 scanner — lives right inside the open box so it's
                   obvious that items scanned here go into THIS box ── */}
              <div className="px-2 pt-2">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePackItem();
                  }}
                >
                  <div className="input-group input-group-sm shadow-sm mb-2">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fa-solid fa-barcode text-primary"></i>
                    </span>
                    <Form.Control
                      ref={itemScanInputRef}
                      type="text"
                      placeholder={isActiveFull ? "Box full — sealing..." : "Scan Light / Battery — adds automatically..."}
                      value={scannedSerial}
                      onChange={(e) => setScannedSerial(e.target.value)}
                      disabled={isActiveFull}
                      className="font-monospace fw-bold bg-white border-start-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {availableQCSuggestions.length > 0 && !isActiveFull && (
                    <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                      <span className="fs-10 text-muted text-nowrap">Quick add:</span>
                      <div className="d-flex gap-1 flex-wrap">
                        {availableQCSuggestions.map((s) => (
                          <Button
                            key={s.serialNo}
                            variant="outline-secondary"
                            size="sm"
                            className="py-0 px-2 font-monospace fs-10 bg-white"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePackItem(s.serialNo);
                            }}
                          >
                            + {s.serialNo}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Form>
              </div>

              {/* ── Icon-tile grid: every packed unit shows as a small
                   Light/Battery icon tile, grouped visually by type via
                   its tint color — matches the "box with light/battery
                   symbols inside" sketch. ── */}
              <div className="px-2 pb-2">
                {box.items.length === 0 ? (
                  <div className="text-center py-4 text-muted fs-11 border rounded bg-light-subtle">
                    No units scanned yet — scan a Light or Battery above.
                  </div>
                ) : (
                  <div
                    className="border rounded p-2 bg-light-subtle"
                    style={{ maxHeight: `${ITEM_GRID_MAX_HEIGHT}px`, overflowY: "auto", paddingTop: "16px" }}
                  >
                    <div className="item-icon-grid">
                      {[...lightItems, ...batteryItems].map((item) => (
                        <ItemIconTile key={item.id} item={item} onRemove={(id) => handleRemoveItem(box.boxId, id)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
            </div>
          </div>
        </Collapse>
      </Card>
    );
  };

  return (
    <div className="packaging-console-page pb-4">
      <PageHeader
        title="Box Packaging Console"
        subtitle="Step 1: Scan a Box → Step 2: Scan QC Passed Lights & Batteries into it (Max 20 Units per Box)"
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

      {/* ══ STEP 1 — BOX SCAN BAR — only shown / active while no box is open ══ */}
      <Card className={`border-0 shadow-sm mb-4 ${activeBox ? "opacity-50" : ""}`}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <Badge bg={activeBox ? "success" : "dark"} className="fs-11 py-2 px-3">
                <i className={`fa-solid ${activeBox ? "fa-check" : "fa-1"} me-1`}></i>
                Step 1 · Scan Box
              </Badge>
              {activeBox && (
                <span className="fs-12 text-success fw-bold">
                  <i className="fa-solid fa-lock-open me-1"></i> {activeBox.boxId} is open
                </span>
              )}
            </div>
            <Form.Select
              size="sm"
              className="w-auto"
              value={destinationProject}
              onChange={(e) => setDestinationProject(e.target.value)}
              disabled={!!activeBox}
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
              handleScanBox();
            }}
          >
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa-solid fa-box text-dark fs-4"></i>
              </span>
              <Form.Control
                ref={boxScanInputRef}
                type="text"
                placeholder={activeBox ? "Box already open — seal it to scan the next one" : "Scan the empty Box's barcode — box opens automatically..."}
                value={boxScanValue}
                onChange={(e) => setBoxScanValue(e.target.value)}
                disabled={!!activeBox}
                className="border-start-0 border-end-0 font-monospace fw-bold fs-15 bg-white"
              />
              {!activeBox && (
                <span className="input-group-text bg-white border-start-0">
                  <i className="fa-solid fa-lock-open text-muted"></i>
                </span>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* ══ LEFT: active box (Step 2 lives inside it)  |  RIGHT: container ══ */}
      <div className="d-flex align-items-start gap-2 flex-nowrap overflow-auto">
        {/* LEFT — sirf current open box */}
        <div className="flex-shrink-0" style={{ width: "680px" }}>
          <h5 className="fw-bold fs-14 text-dark mb-2">Current Packing</h5>

          {activeBox ? (
            renderOpenBox(activeBox)
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5 text-muted fs-12">
                <i className="fa-solid fa-box-open fs-2 mb-2 d-block text-secondary"></i>
                No box open — scan a Box ID above to start packing.
              </Card.Body>
            </Card>
          )}
        </div>

        <div className="border-start align-self-stretch" />

        {/* RIGHT — container */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h5 className="fw-bold fs-14 text-dark mb-2">
            Container <span className="text-muted fw-normal">({sealedBoxes.length} boxes)</span>
          </h5>

          <div className="border rounded bg-white p-3">
            <div className="border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-truck-ramp-box text-secondary"></i>
                <span className="fw-bold fs-13 text-dark">CONT-{destinationProject.slice(0, 2).toUpperCase()}-01</span>
                <Badge bg="warning" text="dark" className="fs-10">
                  Loading
                </Badge>
              </div>
              <span className="fs-11 text-muted">{containerUnits} units loaded</span>
            </div>

            {/* ── Scrollable grid — container ke andar scroll hota hai,
                 chahe kitne bhi boxes ho, pura page scroll nahi karega ── */}
            <div className="container-grid-scroll pe-1" style={{ maxHeight: `${CONTAINER_MAX_HEIGHT}px`, overflowY: "auto" }}>
              <div className="row row-cols-2 g-3">
                {visibleSealed.map((b) => (
                  <div className="col" key={b.boxId}>
                    <SealedBoxTile box={b} landing={justLandedId === b.boxId} />
                  </div>
                ))}

                {/* next landing slot — animation ka target */}
                <div className="col">
                  <div
                    ref={containerSlotRef}
                    className="d-flex align-items-center justify-content-center text-muted fs-10 border border-secondary-subtle rounded p-3"
                  >
                    {sealedBoxes.length === 0 ? "Seal Box" : "Next box"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Udta hua box (left → right) — always fixed-size ghost card ── */}
      {flight && (
        <div
          className="flying-box"
          style={{
            "--flight-top": `${flight.phase === "start" ? flight.from.top : flight.to.top}px`,
            "--flight-left": `${flight.phase === "start" ? flight.from.left : flight.to.left}px`,
            "--flight-width": `${flight.phase === "start" ? flight.from.width : flight.to.width}px`,
            "--flight-height": `${flight.phase === "start" ? flight.from.height : flight.to.height}px`,
            "--flight-transform": flight.phase === "start" ? "rotate(0deg) scale(1)" : "rotate(-3deg) scale(1)",
            "--flight-opacity": flight.phase === "start" ? 1 : 0.15,
          }}
        >
          <div className="p-3">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="font-monospace fw-bold fs-13 text-dark">{flight.box.boxId}</span>
              <Badge bg="success" className="fs-10">
                <i className="fa-solid fa-lock me-1"></i> Sealed
              </Badge>
            </div>
            <div className="fs-11 text-muted text-truncate">{flight.box.project}</div>
            <div className="fs-11 text-muted mt-1">{flight.box.items.length} units · moving into container</div>
          </div>
        </div>
      )}

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