import express from "express"
import {createDispatch , getAllDispatches, getDispatchById, updateDispatch, deleteDispatch, scanPanel, getPanelsByDispatchId , fetchrecieve , scanReceivedPanel, completeReceive , getRecievedispatchById , getRecievepanelsByDispatchId } from "../controllers/dispatchpanel.controller.js"

const router = express.Router();

console.log("scanPanel:", scanPanel);

router.post("/create-dispatch-panel", createDispatch);
router.get("/fetch-all-dispatch-panel", getAllDispatches);
router.get("/fetch-dispatch-panel/:id", getDispatchById);
router.put('/update-dispatch-panel/:id', updateDispatch);
router.get("/delete-dispatch-panel/:id", deleteDispatch);
router.post("/scan-panel", scanPanel);
router.get("/fetch-dispatch-panel-lot/:id", getPanelsByDispatchId);
router.get("/fetch-recieve-panel", fetchrecieve); 
router.get("/fetch-recieve-dispatched-panel/:id", getRecievedispatchById);
router.post("/receive-panel-scan", scanReceivedPanel);
router.put("/complete-receive/:id", completeReceive);
router.get("/recieve-panel/:id", getRecievepanelsByDispatchId);


export default router;




