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
            // Idempotent column additions for MySQL 8.0.21+
            migrationBuilder.Sql("ALTER TABLE `Hospitals` ADD COLUMN IF NOT EXISTS `AppointmentEnabled` tinyint(1) NOT NULL DEFAULT FALSE;");
            migrationBuilder.Sql("ALTER TABLE `Hospitals` ADD COLUMN IF NOT EXISTS `AppointmentSettings` longtext NULL;");
            migrationBuilder.Sql("ALTER TABLE `Hospitals` ADD COLUMN IF NOT EXISTS `Latitude` double NOT NULL DEFAULT 0.0;");
            migrationBuilder.Sql("ALTER TABLE `Hospitals` ADD COLUMN IF NOT EXISTS `Longitude` double NOT NULL DEFAULT 0.0;");

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
