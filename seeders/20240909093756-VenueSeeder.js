'use strict';

const { UUIDV4 } = require('sequelize');



/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
      await queryInterface.bulkInsert('venues', [{
        name: 'Kokan Family Park',
        uuid : Sequelize.literal('UUID()'),
        latitude : 24.878727680114224,
        longitude : 67.07310669078682,
        address : "Kokan Family Park, 74 Haider Ali Rd, Kokan CHS, Karachi, Karachi City, Sindh",
        sports : JSON.stringify({
          'football' : {
            'price' : 500
          },
          'cricket' : {
            'price' :  1000
          }
        }),
        availability : JSON.stringify({
          'football' : {
            'morning' : '8:00 AM - 10:00 AM',
            'evening' : '4:00 PM - 6:00 PM'
          },
          'cricket' : {
            'morning' : '8:00 AM - 10:00 AM',
            'evening' : '4:00 PM - 6:00 PM'
          }
        }),
        price : 3000,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    
  },

  async down (queryInterface, Sequelize) { 
      await queryInterface.bulkDelete('venues', null, {});
  }
};



