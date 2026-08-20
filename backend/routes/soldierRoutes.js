const express = require("express");
const router = express.Router();
const soldierController = require("../controllers/soldierController");
const { requireAuth, isAdmin, isSoldier } = require("../middleware/auth");

// === UNTUK SOLDIER (USER BIASA) ===
// CATATAN: upload/parsing multipart sudah ditangani oleh global middleware
// di server.js (upload.any()). Jangan tambahkan upload.single() di sini
// karena akan menyebabkan "Unexpected end of form" (stream body sudah dipakai).
router.put(
  "/profile",
  requireAuth,
  isSoldier,
  soldierController.updateProfile,
);

// === UNTUK ADMIN ===
// Mendapatkan semua anggota
router.get("/", requireAuth, isAdmin, soldierController.getAllSoldiers);

// Mendapatkan detail anggota
router.get("/:id", requireAuth, isAdmin, soldierController.getSoldierById);

// Update data anggota (reset password, ganti username)
router.put("/:id", requireAuth, isAdmin, soldierController.updateSoldier);

module.exports = router;
