'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('deliveries');
    
    if (!tableDescription.delivery_image) {
      await queryInterface.addColumn('deliveries', 'delivery_image', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('deliveries');
    
    if (tableDescription.delivery_image) {
      await queryInterface.removeColumn('deliveries', 'delivery_image');
    }
  }
};

