"use strict";
const hashPassword = require("../utils/helpers");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          uuid: "82593690-5c20-4e30-ae17-30ceed15c2d7",
          firstName: "umar minhas",
          lastName: "owner",
          userName : 'UmarMinhasOwner',
          email: "umarminhas@sportify.com",
          password: hashPassword("admin@sportify"),
          role: "admin",
          phoneNo: "03008258972",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          uuid: "82593690-5c20-4e30-5e17-30ceeh15j2d7",
          firstName: "Kokan ground",
          lastName: "owner",
          userName : 'KokanOwner',
          email: "kokan@sportify.com",
          password: hashPassword("admin@sportify"),
          phoneNo: "03008258977",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          uuid: "82595470-5h20-4f30-ae17-30ceed15c2d7",
          firstName: "spiritfield",
          lastName: "owner",
          userName : 'SpiritFieldOwner',
          email: "spiritfield@sportify.com",
          password: hashPassword("admin@sportify"),
          role: "admin",
          phoneNo: "03008258978",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
