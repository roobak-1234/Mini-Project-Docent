namespace WebDashboardBackend.Models
{
    public class AmbulanceStatus
    {
        public int Id { get; set; }
        public string Registration { get; set; } = string.Empty;
        public string Location { get; set; } = "37.7749,-122.4194";
        public bool Available { get; set; }
        public bool IsOnline { get; set; }
        public string? StaffName { get; set; }
        public string? HospitalId { get; set; }
        public int BatteryLevel { get; set; } = 100;
        public int SpO2 { get; set; } = 98;
        public int HeartRate { get; set; } = 75;
    }
}