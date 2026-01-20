'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.report_price) {
      await queryInterface.addColumn('users', 'report_price', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 7000,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (tableDescription.report_price) {
      await queryInterface.removeColumn('users', 'report_price');
    }
  }
};

