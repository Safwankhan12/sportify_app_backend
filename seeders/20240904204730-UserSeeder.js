"use strict";
const hashPassword = require("../utils/helpers");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
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
          accountNo : 'PK-BAHL-22232234324',
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
          accountNo : 'PK-MEZN-03377277384',
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
          accountNo : 'PK-UBL-30082578992',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          uuid: "82595470-5h20-4f30-ae17-30cfe51522d7",
          firstName: "National",
          lastName: "Coaching Center",
          userName : 'NCCOwner',
          email: "Ncc@sportify.com",
          password: hashPassword("admin@sportify"),
          role: "admin",
          phoneNo: "03008258278",
          accountNo : 'PK-HBL-30082578992',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          uuid: "82335470-5h20-4f30-jk17-30ceed15c2d7",
          firstName: "Imran",
          lastName: "Khan",
          userName : 'ImranKhanOwner',
          email: "Imrankhan@sportify.com",
          password: hashPassword("admin@sportify"),
          role: "admin",
          phoneNo: "03463909988",
          accountNo : 'PK-UBL-3008257334432',
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
