import express from "express";
import { create, read, update, upload, uploadByLink } from "../controllers/property";

const router = express.Router();

// middleware
import { requireSignin, isPartner } from "../middlewares";

router.post('/upload-by-link', uploadByLink);

router.post('/upload', upload);

router.post("/property", requireSignin, create);
router.put("/property/:slug", requireSignin, update);
router.get("/property/:slug", read);

module.exports = router;