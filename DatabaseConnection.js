const {Sequelize} = require('sequelize');
require('dotenv').config()
const DBConnection = async ()=>{
const sequelize = new Sequelize('sportify_app', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  });

  try{
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
  }catch(error)
  {
    console.error(error)
    throw error
  }
}
module.exports = DBConnection;