'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid : {
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : false,
        unique : true
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      resetCode : {
        type : Sequelize.STRING
      },
      resetCodeExpiration : {
        type : Sequelize.DATE
      },
      role : {
        type : Sequelize.ENUM('admin', 'user'),
        defaultValue : 'user'
      },
      password:{
        type : Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};