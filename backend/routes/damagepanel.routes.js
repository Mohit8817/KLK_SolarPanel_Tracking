import express from "express";
import upload from "../middleware/uploads.js";


import {
  createDamagePanel,
  getAllDamagePanels,
  getDamageByPanelNo,
  getDamageById,
  updateDamagePanel,
  getDamageTypeOnePanels,
  getDamageTypeTwoPanels,
  getDamageTypeThreePanels
} from "../controllers/damagepanel.controller.js"

const router = express.Router();

/* ===============================
   CREATE DAMAGE ENTRY
=============================== */
router.post(
  "/create-damage-panel",
  upload.single("image"),
  createDamagePanel
);

/* ===============================
   GET ALL DAMAGE PANELS
=============================== */
router.get("/all-damage-panel", getAllDamagePanels);

/* ===============================
   GET DAMAGE BY PANEL NO
=============================== */
router.get("/damage-panel/:panel_no", getDamageByPanelNo);

/* ===============================
   GET DAMAGE BY UNIQUE ID
=============================== */
router.get("/damage-panel/:id", getDamageById);


router.put("/update-damage-panel/:id", updateDamagePanel);



/* ===============================
   FETCH DAMAGE TYPE 1
=============================== */
router.get("/get-production-damage-panel", getDamageTypeOnePanels);

/* ===============================
   FETCH DAMAGE TYPE 1
=============================== */
router.get("/get-damage-panel", getDamageTypeTwoPanels);

/* ===============================
   FETCH DAMAGE TYPE 2
=============================== */
router.get("/get-damage-panel-onsite", getDamageTypeThreePanels);


export default router;
