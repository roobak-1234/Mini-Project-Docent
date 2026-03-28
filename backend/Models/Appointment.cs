using System;
using System.ComponentModel.DataAnnotations;

namespace WebDashboardBackend.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public string UniqueHospitalId { get; set; } = string.Empty;

        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;

        public string Reason { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string SelectedTime { get; set; } = string.Empty;

        // Pending | Confirmed | Cancelled | Completed
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
