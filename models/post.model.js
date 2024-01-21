const { Sequelize, DataTypes } = require('sequelize');
const database= process.env.DB_NAME
const username=process.env.DB_USER
const password=process.env.DB_PASS
const sequelize = new Sequelize(database, username, password, {
  host: process.env.HOST,
  dialect: 'postgres'
});

const Post = sequelize.define('Post', {
  userId: {
    type: DataTypes.UUID, // Assuming you use UUIDs as ObjectIds in MongoDB
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Post;
