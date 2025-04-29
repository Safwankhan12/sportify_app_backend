"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bookingDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      bookingTime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      venueName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      venueId : {
        type : Sequelize.UUID,
        allowNull : true,
      },
      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status : {
        type : Sequelize.ENUM('Pending','Confirmed','Rejected'),
        defaultValue : 'Pending',
        allowNull : false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex('Bookings', ['venueId'], {
      name: 'bookings_venue_id_idx'
    });
    
    // Index on userEmail - Used for finding bookings by user
    await queryInterface.addIndex('Bookings', ['userEmail'], {
      name: 'bookings_user_email_idx'
    });
    
    // Compound index on venueId and status - Used in getbookingbystatus and other routes
    await queryInterface.addIndex('Bookings', ['venueId', 'status'], {
      name: 'bookings_venue_status_idx'
    });
    
    // Compound index on venueName and bookingDate - Used in overlap checking
    await queryInterface.addIndex('Bookings', ['venueName', 'bookingDate'], {
      name: 'bookings_venue_date_idx'
    });
    
    // Index on status - Used in many queries 
    await queryInterface.addIndex('Bookings', ['status'], {
      name: 'bookings_status_idx'
    });
    
    // Compound index on venueName, bookingDate, and status - Used specifically in time overlap checks
    await queryInterface.addIndex('Bookings', ['venueName', 'bookingDate', 'status'], {
      name: 'bookings_venue_date_status_idx'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Bookings', 'bookings_venue_id_idx');
    await queryInterface.removeIndex('Bookings', 'bookings_user_email_idx');
    await queryInterface.removeIndex('Bookings', 'bookings_venue_status_idx');
    await queryInterface.removeIndex('Bookings', 'bookings_venue_date_idx');
    await queryInterface.removeIndex('Bookings', 'bookings_status_idx');
    await queryInterface.removeIndex('Bookings', 'bookings_venue_date_status_idx');
    await queryInterface.dropTable("Bookings");
  },
};
