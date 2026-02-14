module.exports = app => {
    const ware = require("../controllers/ware.controller.js");
    const { authenticate } = require("../middleware/auth.middleware");
  
    var router = require("express").Router();
    
    // Apply authentication middleware to all routes
    router.use(authenticate);
  
    // Create a new Tutorial
    router.post("/", ware.create);
  
    // Retrieve all Tutorials
    router.get("/", ware.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", ware.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", ware.findOne);
  
    // Update a Tutorial with id
    router.patch("/:id", ware.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", ware.delete);
  
    // Delete all Tutorials
    router.delete("/", ware.deleteAll);
  
    app.use('/api/ware', router);
  };
  