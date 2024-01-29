import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/database.js';

const TaskModel = sequelize.define('tasks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parent_task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('COMPLETED', 'PENDING'),
    defaultValue: 'PENDING',
    allowNull: false,
  }
},{
  timestamps: true,
  tableName: "tasks"
});

TaskModel.hasMany(TaskModel, {
  foreignKey: 'parent_task_id',
  as: 'subTasks',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export default TaskModel;
