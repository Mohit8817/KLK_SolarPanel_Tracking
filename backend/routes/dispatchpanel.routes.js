import express from "express"
import {createDispatch , getAllDispatches, getDispatchById, updateDispatch, deleteDispatch, scanPanel, getPanelsByDispatchId } from "../controllers/dispatchpanel.controller.js"

const router = express.Router();

console.log("scanPanel:", scanPanel);

router.post("/create-dispatch-panel", createDispatch);
router.get("/fetch-all-dispatch-panel", getAllDispatches);
router.get("/fetch-dispatch-panel/:id", getDispatchById);
router.put('/update-dispatch-panel/:id', updateDispatch);
router.get("/delete-dispatch-panel/:id", deleteDispatch);
router.post("/scan-panel", scanPanel);
router.get("/fetch-dispatch-panel-lot/:id", getPanelsByDispatchId);

export default router;




