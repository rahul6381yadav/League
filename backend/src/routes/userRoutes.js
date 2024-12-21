const router = require("express").Router();
const usersController = require("../controller/UserController");

router.post("/api/v1/users/add-user", usersController.UserSignup);

module.exports = router;