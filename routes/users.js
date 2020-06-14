const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");

const UserController = require("../controllers/users");

router.get("/", authentication, UserController.users_get_all);
router.put("/forgot", UserController.forgot_password);
router.put("/reset", UserController.reset_password);
router.get("/pendingAcc", authentication, UserController.get_pending_accounts);
router.post("/signup", UserController.user_signup);
router.post("/login", UserController.user_login);
router.get("/logout", authentication, UserController.user_logout);
router.get("/:userId", authentication, UserController.user_get_by_id);
router.delete("/:userId", UserController.user_delete);
router.patch(
  "/:userId/account",
  UserController.update_account_status
);

module.exports = router;
