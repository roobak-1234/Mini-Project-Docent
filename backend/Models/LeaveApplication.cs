using System.ComponentModel.DataAnnotations;

namespace WebDashboardBackend.Models
{
    public class LeaveApplication
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string StaffType { get; set; } = string.Empty;

        [Required]
        public string StartDate { get; set; } = string.Empty;

        [Required]
        public string EndDate { get; set; } = string.Empty;

        [Required, MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Pending";

        [MaxLength(200)]
        public string? ApprovedBy { get; set; }

        [MaxLength(500)]
        public string? Comments { get; set; }

        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");
    }
}
