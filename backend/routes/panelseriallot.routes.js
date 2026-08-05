import express from "express";
import {
  createPanelSerialLot,
  getAllPanelSerialLots,
  deletePanelSerialLot,
  getPanelsByLotId,
  getNextPanelNumber,
  previewPanelSerialFormat,
} from "../controllers/panelseriallot.controller.js";

const router = express.Router();

router.post("/next-starting-no", getNextPanelNumber);
router.post("/preview-serial-format", previewPanelSerialFormat);
router.post("/create-panel-serial", createPanelSerialLot);

// VIEW (all rows)
router.get("/all-panel-serial", getAllPanelSerialLots);

// DELETE
router.delete("/delete-panel-serial/:id", deletePanelSerialLot);

router.get("/allpanels/lot/:id", getPanelsByLotId);


export default router;
