'use strict';
const { Sequelize } = require('sequelize');
const db = require('@/config/database.js');

const { DataTypes } = Sequelize;

const AuditTrails = db.define('audittrails', {
   id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
   },
   userId: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   userName: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   method: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   description: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   body: {
      type: DataTypes.JSON,
      allowNull: true,
   },
   query: {
      type: DataTypes.JSON,
      allowNull: true,
   },
   params: {
      type: DataTypes.JSON,
      allowNull: true,
   },
   timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
   },
   updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
   },
}, {
   timestamps: true,
});

module.exports = AuditTrails;