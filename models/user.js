'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    },
    accountConfirmationToken: DataTypes.STRING,
    accountConfirmationTokenExpiresAt: DataTypes.BIGINT,
    accountConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accountConfirmedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    remember_token: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};