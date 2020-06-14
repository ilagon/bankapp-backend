const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");

const CustomerController = require("../controllers/customers");

router.get("/", authentication, CustomerController.customers_get_all);
router.post("/", authentication, CustomerController.customer_create);
router.get(
  "/creditcard_stats",
  CustomerController.customers_get_pending_cc
);
router.get(
  "/:customerId",
  authentication,
  CustomerController.customer_get_by_id
);
router.patch(
  "/:customerId/creditcard",
  CustomerController.update_creditcard
);

module.exports = router;
