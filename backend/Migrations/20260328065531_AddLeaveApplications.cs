using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDashboardBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS `LeaveApplications` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `Username` longtext CHARACTER SET utf8mb4 NOT NULL,
                `StaffType` longtext CHARACTER SET utf8mb4 NOT NULL,
                `StartDate` longtext CHARACTER SET utf8mb4 NOT NULL,
                `EndDate` longtext CHARACTER SET utf8mb4 NOT NULL,
                `Reason` longtext CHARACTER SET utf8mb4 NOT NULL,
                `Status` longtext CHARACTER SET utf8mb4 NOT NULL,
                `ApprovedBy` longtext CHARACTER SET utf8mb4 NULL,
                `Comments` longtext CHARACTER SET utf8mb4 NULL,
                `CreatedAt` longtext CHARACTER SET utf8mb4 NOT NULL,
                CONSTRAINT `PK_LeaveApplications` PRIMARY KEY (`Id`)
            ) CHARACTER SET=utf8mb4;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaveApplications");
        }
    }
}
