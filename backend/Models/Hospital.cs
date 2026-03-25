namespace WebDashboardBackend.Models
{
    public class Hospital
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string UniqueHospitalId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}