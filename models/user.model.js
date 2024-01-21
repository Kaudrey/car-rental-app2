const { Sequelize, DataTypes } = require('sequelize');
const database= process.env.DB_NAME
const username=process.env.DB_USER
const password=process.env.DB_PASS
const sequelize = new Sequelize(database, username, password, {
  host: process.env.HOST,
  dialect: 'postgres'
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 10]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = User;
