'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
  
   await queryInterface.bulkInsert('users', [{
     firstName: 'Super',
     lastName: "Admin",
     email:"admin@sportify.com",
     password:"admin@sportify",
     createdAt : new Date(),
     updatedAt : new Date()
   }], {});
  
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
