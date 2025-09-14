// models/JobReport.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class JobReport extends Model<any> {
  public id!: number;
  public bookingId!: number;
  public techId!: number | null; // user/tech who did the job
  public beforePhotos!: string | null; // JSON array of urls
  public afterPhotos!: string | null;  // JSON array of urls
  public notes!: string | null;
  public difficulty!: number | null; // 1-5
  public customerRating!: number | null; // 1-5
  public arrivalTime!: Date | null;
  public startTime!: Date | null;
  public completionTime!: Date | null;
  public totalDurationMins!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobReport.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingId: { type: DataTypes.INTEGER, allowNull: false },
  // techId: { type: DataTypes.INTEGER, allowNull: true },
  beforePhotos: { type: DataTypes.TEXT, allowNull: true },
  afterPhotos: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  difficulty: { type: DataTypes.INTEGER, allowNull: true },
  customerRating: { type: DataTypes.INTEGER, allowNull: true },
  arrivalTime: { type: DataTypes.DATE, allowNull: true },
  startTime: { type: DataTypes.DATE, allowNull: true },
  completionTime: { type: DataTypes.DATE, allowNull: true },
  totalDurationMins: { type: DataTypes.INTEGER, allowNull: true },
}, {
    sequelize,
    tableName: "job_reports",
  modelName: "JobReport",
  timestamps: true,
});

export default JobReport;
