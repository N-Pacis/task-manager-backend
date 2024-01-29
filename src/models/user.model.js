import { sequelize } from '../utils/database.js';
import { DataTypes } from 'sequelize';

const UserModel = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    selectable: false,
  }
},{
    timestamps:true,
  },
);


export default UserModel