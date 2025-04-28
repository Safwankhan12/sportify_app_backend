'use strict';

const { UUID } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('venues',[
      {
        uuid : Sequelize.literal('UUID()'),
        name : "Umar Minhas futsal ground",
        latitude : 24.937524903205453,
        longitude : 67.1351360064983,
        address : "Umar Minhas Futsal Ground, W4PM+XG2, Unnamed Road, University Of Karachi, Karachi, Karachi City, Sindh",
        sports : "Football and cricket",
        availability : "4 to 6",
        price : 5000,
        ownerId : "82593690-5c20-4e30-ae17-30ceed15c2d7"
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : "Kokan ground",
        latitude : 24.937524903205453,
        longitude : 67.1351360064983,
        address : "Umar Minhas Futsal Ground, W4PM+XG2, Unnamed Road, University Of Karachi, Karachi, Karachi City, Sindh",
        sports : "Football and cricket",
        availability : "4 to 6",
        price : 3000,
        ownerId : "82593690-5c20-4e30-5e17-30ceeh15j2d7"
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : "spiritfield ground",
        latitude : 24.937524903205453,
        longitude : 67.1351360064983,
        address : "Umar Minhas Futsal Ground, W4PM+XG2, Unnamed Road, University Of Karachi, Karachi, Karachi City, Sindh",
        sports : "Football and cricket",
        availability : "4 to 6",
        price : 2200,
        ownerId : "82595470-5h20-4f30-ae17-30ceed15c2d7"
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('venues', null, {});
     
  }
};
