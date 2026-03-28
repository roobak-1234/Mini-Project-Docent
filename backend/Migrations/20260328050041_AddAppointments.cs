using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDashboardBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Robust stored procedure approach for MySQL to handle idempotent column additions
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
                CREATE PROCEDURE AddColumnIfNotExists(IN tableName VARCHAR(255), IN columnName VARCHAR(255), IN columnDefinition VARCHAR(255))
                BEGIN
                    IF NOT EXISTS (
                        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tableName AND COLUMN_NAME = columnName
                    ) THEN
                        SET @sql = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition);
                        PREPARE stmt FROM @sql;
                        EXECUTE stmt;
                        DEALLOCATE PREPARE stmt;
                    END IF;
                END;
            ");

            migrationBuilder.Sql("CALL AddColumnIfNotExists('Hospitals', 'AppointmentEnabled', 'tinyint(1) NOT NULL DEFAULT 0');");
            migrationBuilder.Sql("CALL AddColumnIfNotExists('Hospitals', 'AppointmentSettings', 'longtext NULL');");
            migrationBuilder.Sql("CALL AddColumnIfNotExists('Hospitals', 'Latitude', 'double NOT NULL DEFAULT 0.0');");
            migrationBuilder.Sql("CALL AddColumnIfNotExists('Hospitals', 'Longitude', 'double NOT NULL DEFAULT 0.0');");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS AddColumnIfNotExists;");

            // Idempotent table creation
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS `Appointments` (
                    `Id` int NOT NULL AUTO_INCREMENT,
                    `UniqueHospitalId` longtext NOT NULL,
                    `PatientId` longtext NOT NULL,
                    `PatientName` longtext NOT NULL,
                    `PatientPhone` longtext NOT NULL,
                    `Reason` longtext NOT NULL,
                    `AppointmentDate` datetime(6) NOT NULL,
                    `SelectedTime` longtext NOT NULL,
                    `Status` longtext NOT NULL,
                    `CreatedAt` datetime(6) NOT NULL,
                    PRIMARY KEY (`Id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropColumn(
                name: "AppointmentEnabled",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "AppointmentSettings",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Hospitals");
        }
    }
}
