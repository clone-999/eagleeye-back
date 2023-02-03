import express from "express";
import { partnerProperties } from "../controllers/partner";

const router = express.Router();

// middleware
import { requireSignin } from "../middlewares";

router.get("/partner-properties", requireSignin, partnerProperties);

module.exports = router;