import express from "express"
import {createProductionPanel, fetchAllProductionPanels, fetchProductionPanelById, deleteProductionPanel, getPanelsByProductionId, exportProductionPanelNumbers} from '../controllers/productionpanel.controller.js'
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


export default router
