const router = require("express").Router();
const { registrar, login, perfil, actualizarPerfil, obtenerUsuarioPorId } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.post("/registro", registrar);
router.post("/login", login);
router.get("/perfil", authMiddleware, perfil);
router.put("/perfil", authMiddleware, upload.single("foto"), actualizarPerfil);
router.get("/usuario/:id", obtenerUsuarioPorId);

module.exports = router;
