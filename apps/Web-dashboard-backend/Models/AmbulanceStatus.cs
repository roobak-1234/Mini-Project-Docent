namespace WebDashboardBackend.Models
{
    public class AmbulanceStatus
    {
        public int Id { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool Available { get; set; }
    }
}