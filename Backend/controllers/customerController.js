import Customer from "../models/Customer.js";

// ===============================
// GET ALL CUSTOMERS
// ===============================
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 });

    res.status(200).json(customers);
  } catch (err) {
    console.error("Get customers error:", err);

    res.status(500).json({
      message: "Customers fetch nahi ho paaye",
      error: err.message,
    });
  }
};

// ===============================
// GET SINGLE CUSTOMER
// ===============================
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer nahi mila",
      });
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error("Get customer error:", err);

    res.status(500).json({
      message: "Customer fetch nahi ho paaya",
      error: err.message,
    });
  }
};

// ===============================
// CREATE CUSTOMER
// ===============================
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name aur phone required hai",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email: email || "",
      address: address || "",
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error("Create customer error:", err);

    res.status(400).json({
      message: err.message,
    });
  }
};

// ===============================
// UPDATE CUSTOMER
// ===============================
export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        email: email || "",
        address: address || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer nahi mila",
      });
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error("Update customer error:", err);

    res.status(400).json({
      message: err.message,
    });
  }
};

// ===============================
// DELETE CUSTOMER
// ===============================
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer nahi mila",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (err) {
    console.error("Delete customer error:", err);

    res.status(500).json({
      message: "Customer delete nahi ho paaya",
      error: err.message,
    });
  }
};



// import Customer from "../models/Customer.js";

// export const getCustomers = async (req, res) => {
//   const customers = await Customer.find().sort({ createdAt: -1 });
//   res.json(customers);
// };

// export const createCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.create(req.body);
//     res.status(201).json(customer);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const updateCustomer = async (req, res) => {
//   const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   if (!customer) return res.status(404).json({ message: "Customer not mila" });
//   res.json(customer);
// };

// export const deleteCustomer = async (req, res) => {
//   const customer = await Customer.findByIdAndDelete(req.params.id);
//   if (!customer) return res.status(404).json({ message: "Customer nahi mila" });
//   res.json({ message: "Customer deleted" });
// };