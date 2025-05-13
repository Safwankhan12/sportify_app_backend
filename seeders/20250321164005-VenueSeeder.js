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
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : "National Coaching Center",
        latitude : 24.8946326,
        longitude : 67.0755218,
        address : "Umar Minhas Futsal Ground, W4PM+XG2, Unnamed Road, University Of Karachi, Karachi, Karachi City, Sindh",
        sports : "Badminton",
        availability : "4 to 6",
        price : 3500,
        ownerId : "82595470-5h20-4f30-ae17-30cfe51522d7"
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : "Imran Khan ground",
        latitude : 24.920411,
        longitude : 67.0941117,
        address : "Umar Minhas Futsal Ground, W4PM+XG2, Unnamed Road, University Of Karachi, Karachi, Karachi City, Sindh",
        sports : "cricket",
        availability : "4 to 6",
        price : 6000,
        ownerId : "82335470-5h20-4f30-jk17-30ceed15c2d7"
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    
      await queryInterface.bulkDelete('venues', null, {});
     
  }
};
