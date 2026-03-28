using Microsoft.EntityFrameworkCore;
using WebDashboardBackend.Models;
using System.Text.Json;

namespace WebDashboardBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<AmbulanceStatus> AmbulanceStatuses { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.AssignedPatientIds)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());

                entity.Property(u => u.Permissions)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<UserPermissions>(v, (JsonSerializerOptions?)null));
            });

            modelBuilder.Entity<Hospital>(entity =>
            {
                entity.Property(h => h.AmbulanceIds)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());
            });
        }
    }
}