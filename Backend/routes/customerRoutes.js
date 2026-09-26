import express from "express";
const router = express.Router();
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { validate, customerSchema, customerUpdateSchema } from "../middleware/validate.js";

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", validate(customerSchema), createCustomer);
router.put("/:id", validate(customerUpdateSchema), updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;




// import express from "express";
// const router = express.Router();
// import {
//   getCustomers,
//   getCustomerById,
//   createCustomer,
//   updateCustomer,
//   deleteCustomer,
// } from "../controllers/customerController.js";

// router.get("/", getCustomers);
// router.get("/:id", getCustomerById);
// router.post("/", createCustomer);
// router.put("/:id", updateCustomer);
// router.delete("/:id", deleteCustomer);

// export default router;


