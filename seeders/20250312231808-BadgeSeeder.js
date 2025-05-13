'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('badges',[
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'beginner',
        description : 'Earned after logging in 3 times or more',
        type : 'beginner',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'engaged',
        description : 'Earned after joining 5 games',
        type : 'engaged',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'hyperActive',
        description : 'Earned when reaching "On Fire" level',
        type : 'hyperActive',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'gameCreator',
        description : 'Earned after creating 3 games',
        type : 'gameCreator',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'firstVictory',
        description : 'Earned after winning first match',
        type : 'firstVictory',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'champion',
        description : 'Earned after winning 10 games',
        type : 'champion',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid : Sequelize.literal('UUID()'),
        name : 'legend',
        description : 'Earned after reaching 5000 activity points',
        type : 'legend',
        icon : 'https://xyzbdge',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('badges', null, {});
  }
};
