import express from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

router.post("/", createCustomer);

router.put("/:id", updateCustomer);

router.delete("/:id", deleteCustomer);

export default router;


// import express from "express";
// import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../controllers/customerController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();
// router.get("/", protect, getCustomers);
// router.post("/", protect, createCustomer);
// router.put("/:id", protect, updateCustomer);
// router.delete("/:id", protect, deleteCustomer);

// export default router;