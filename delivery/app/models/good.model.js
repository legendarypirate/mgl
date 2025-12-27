module.exports = (sequelize, Sequelize) => {
    const Good = sequelize.define("good", {
      ware_id: {
        type: Sequelize.INTEGER,
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      in_delivery: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      delivered: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      name: {
        type: Sequelize.STRING
      },
     
    });
  
    return Good;
  };
  