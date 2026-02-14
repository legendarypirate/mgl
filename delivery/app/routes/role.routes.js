module.exports = app => {
    const role = require("../controllers/role.controller.js");
    const { authenticate } = require("../middleware/auth.middleware");
  
    var router = require("express").Router();
    
    // Apply authentication middleware to all routes
    router.use(authenticate);
  
    // Create a new Tutorial
    router.post("/", role.create);
  
    // Retrieve all Tutorials
    router.get("/", role.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", role.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", role.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", role.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", role.delete);
  
    // Delete all Tutorials
    router.delete("/", role.deleteAll);
  
    app.use('/api/role', router);
  };
  