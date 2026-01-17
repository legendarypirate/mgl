'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('requests');
    
    if (!tableDescription.approved_stock) {
      await queryInterface.addColumn('requests', 'approved_stock', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('requests');
    
    if (tableDescription.approved_stock) {
      await queryInterface.removeColumn('requests', 'approved_stock');
    }
  }
};

