import express from "express"
import {createProductionPanel, fetchAllProductionPanels, fetchProductionPanelById, deleteProductionPanel, getPanelsByProductionId, exportProductionPanelNumbers, viewVendorProductionPanels, createManufacturingPanel, getAllManufacturingPanels} from '../controllers/productionpanel.controller.js'
const router = express.Router()

router.post("/create-production-panel", createProductionPanel);
router.get("/production-panel", fetchAllProductionPanels);
router.get("/production-panel/:id", fetchProductionPanelById);
router.delete("/delete-production-panel/:id", deleteProductionPanel);
router.get("/productionlot/:id", getPanelsByProductionId);
router.get(
  "/export-production-panel-numbers/:id",
  exportProductionPanelNumbers
);

router.get("/vendor-production-panel", viewVendorProductionPanels);
router.post("/create-manufacturing-panel", createManufacturingPanel);
router.get("/all-manufacturing-panels/:production_id", getAllManufacturingPanels);


export default router
