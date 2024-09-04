const {Sequelize} = require('sequelize');
const DBConnection = async ()=>{
const sequelize = new Sequelize('sportify_app', 'root', '', {
    host: 'localhost',
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