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
        type: Sequelize.STRING,
        allowNull : false,
        unique : true
      },
      password:{
        type : Sequelize.STRING
      },
      phoneNo : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : true
      },
      gender : {
        type : Sequelize.ENUM('male', 'female'),
        allowNull : true
      },
      address : {
        type : Sequelize.STRING,
        allowNull : true
      },
      profilePicture :{
        type : Sequelize.STRING,
        allowNull : true
      },
      activityPoints : {
        type : Sequelize.INTEGER,
        defaultValue : 0
      },
      loginCount : {
        type : Sequelize.INTEGER,
        defaultValue : 0
      },
      resetCode : {
        type : Sequelize.STRING
      },
      resetCodeExpiration : {
        type : Sequelize.DATE
      },
      isPhoneVerified:{
        type : Sequelize.BOOLEAN,
        defaultValue : false
      },
      fcm_token : {
        type : Sequelize.STRING,
        allowNull : true
      },
      role : {
        type : Sequelize.ENUM('admin', 'user'),
        defaultValue : 'user'
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