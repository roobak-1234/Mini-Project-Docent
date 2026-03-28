using System.Collections.Generic;

namespace WebDashboardBackend.Models
{
    public class Hospital
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UniqueHospitalId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string EmergencyEmail { get; set; } = string.Empty;
        public int AmbulanceCount { get; set; }
        public int Ventilators { get; set; }
        public int IcuBeds { get; set; }
        public int OxygenStock { get; set; }
        public List<string> AmbulanceIds { get; set; } = new List<string>();
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string AdminContact { get; set; } = string.Empty; // the doctor who registered it
        public bool AppointmentEnabled { get; set; } = false;
        public string AppointmentSettings { get; set; } = string.Empty; // JSON
    }
}