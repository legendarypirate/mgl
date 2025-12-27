module.exports = (sequelize, Sequelize) => {
  const GoodHistory = sequelize.define("good_history", {
    good_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // 1: Admin income (орлого), 2: Admin expense (зарлага), 
      // 3: Delivery created (in_delivery), 4: Delivery cancelled (back to stock),
      // 5: Delivery completed (delivered)
      validate: {
        isIn: [[1, 2, 3, 4, 5]],
      },
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    delivery_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Admin user who made income/expense transaction',
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  return GoodHistory;
};

