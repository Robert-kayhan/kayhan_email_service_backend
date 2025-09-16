// models/JobReport.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class JobReport extends Model<any> {
  public id!: number;
  public bookingId!: number;
  public techId!: number | null; // user/tech who did the job
  public techName!: string | null; // optional name of technician
  public beforePhotos!: string[] | null; // JSON array of URLs
  public afterPhotos!: string[] | null;  // JSON array of URLs
  public notes!: string | null;
  public tips!: string | null;
  public difficulty!: number | null; // 1-5
  public customerRating!: number | null; // 1-5
  public arrivalTime!: Date | null;
  public startTime!: Date | null;
  public completionTime!: Date | null;
  public totalDurationMins!: number | null;
  public status!: "Pending" | "In Progress" | "Completed" | "Cancelled" | "Rescheduled";
  public cancelReason!: string | null;
  public rescheduleTime!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobReport.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: false },
    techId: { type: DataTypes.INTEGER, allowNull: true },
    techName: { type: DataTypes.STRING, allowNull: true },
    beforePhotos: { type: DataTypes.JSON, allowNull: true }, // store as JSON array
    afterPhotos: { type: DataTypes.JSON, allowNull: true },  // store as JSON arra
    notes: { type: DataTypes.TEXT, allowNull: true },
    tips: { type: DataTypes.TEXT, allowNull: true },
    difficulty: { type: DataTypes.STRING, allowNull: true },
    customerRating: { type: DataTypes.INTEGER, allowNull: true },
    arrivalTime: { type: DataTypes.DATE, allowNull: true },
    startTime: { type: DataTypes.DATE, allowNull: true },
    completionTime: { type: DataTypes.DATE, allowNull: true },
    totalDurationMins: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Cancelled", "Rescheduled"),
      defaultValue: "Pending",
      allowNull: false,
    },
    cancelReason: { type: DataTypes.TEXT, allowNull: true },
    rescheduleTime: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "job_reports",
    modelName: "JobReport",
    timestamps: true,
  }
);

export default JobReport;
