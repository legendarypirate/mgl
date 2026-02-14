module.exports = app => {
    const permission = require("../controllers/permission.controller.js");
    const { authenticate } = require("../middleware/auth.middleware");
  
    var router = require("express").Router();
    
    // Apply authentication middleware to all routes
    router.use(authenticate);
  
    // Create a new permission
    router.post("/", permission.create);
  
    // Retrieve all permissions
    router.get("/", permission.findAll);
  
    // Retrieve a single permission with id
    router.get("/:id", permission.findOne);
  
    // Update a permission with id
    router.put("/:id", permission.update);
  
    // Delete a permission with id
    router.delete("/:id", permission.delete);
  
    // Delete all permissions
    router.delete("/", permission.deleteAll);
  
    app.use('/api/permission', router);
  };
  