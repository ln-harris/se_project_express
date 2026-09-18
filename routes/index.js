const router = require("express").Router();

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { login, createUser } = require("../controllers/users");
const { getItems } = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");
const {
  validateUserInfo,
  validateAuthentication,
} = require("../middlewares/validation");
const NotFoundError = require("../errors/NotFoundError");

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserInfo, createUser);
router.get("/items", getItems);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res, next) => {
  next(new NotFoundError(`Requested resource ${req.originalUrl} not found`));
});

module.exports = router;
