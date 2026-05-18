const router = require("express").Router();
const { crearResena, resenasDeVendedor } = require("../controllers/reviewController");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, crearResena);
router.get("/vendedor/:vendedorId", resenasDeVendedor);

module.exports = router;
