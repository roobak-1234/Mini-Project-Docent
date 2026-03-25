using System.Collections.Generic;

namespace WebDashboardBackend.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? DoctorId { get; set; }
        public string? UniqueDoctorId { get; set; }
        public string UserType { get; set; } = "patient"; // 'doctor' | 'patient' | 'nurse' | 'staff'
        public string? Country { get; set; }
        public string? MedicalId { get; set; }
        public string? StaffType { get; set; }
        public string? Shift { get; set; } // 'Morning' | 'Evening' | 'Night'
        public string? VehicleNumber { get; set; }
        public string? JunctionId { get; set; }
        public string? BadgeNumber { get; set; }
        public List<string>? AssignedPatientIds { get; set; }
        public UserPermissions? Permissions { get; set; }
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("O");
        public bool IsOnline { get; set; }
    }

    public class UserPermissions
    {
        public bool CanAccessPatientData { get; set; }
    }
}