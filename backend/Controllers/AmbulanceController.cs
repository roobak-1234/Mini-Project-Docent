using Microsoft.AspNetCore.Mvc;
using WebDashboardBackend.Models;
using WebDashboardBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AmbulanceController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AmbulanceController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("status/{hospitalId}")]
        public async Task<IActionResult> GetAmbulances(string hospitalId)
        {
            var fleet = await _db.AmbulanceStatuses
                .Where(a => a.HospitalId == hospitalId)
                .ToListAsync();
            return Ok(fleet);
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateStatus([FromBody] AmbulanceStatus status)
        {
            var existing = await _db.AmbulanceStatuses.FirstOrDefaultAsync(a => a.Registration == status.Registration);
            if (existing == null)
            {
                _db.AmbulanceStatuses.Add(status);
            }
            else
            {
                existing.Location = status.Location;
                existing.Available = status.Available;
                existing.IsOnline = status.IsOnline;
                existing.StaffName = status.StaffName;
                existing.SpO2 = status.SpO2;
                existing.HeartRate = status.HeartRate;
                existing.BatteryLevel = status.BatteryLevel;
            }
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Ambulance status updated" });
        }
    }
}