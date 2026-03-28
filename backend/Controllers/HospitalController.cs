using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebDashboardBackend.Models;
using WebDashboardBackend.Data;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HospitalController : ControllerBase
    {
        private readonly AppDbContext _db;

        public HospitalController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var hospitals = await _db.Hospitals
                .OrderByDescending(h => h.Id)
                .ToListAsync();

            return Ok(hospitals);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Hospital hospital)
        {
            if (await _db.Hospitals.AnyAsync(h => h.UniqueHospitalId == hospital.UniqueHospitalId))
            {
                return Conflict(new { success = false, message = "Hospital already exists" });
            }
            _db.Hospitals.Add(hospital);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Hospital registered successfully", hospital = hospital });
        }

        [HttpGet("{uniqueId}")]
        public async Task<IActionResult> GetByUniqueId(string uniqueId)
        {
            var hospital = await _db.Hospitals.FirstOrDefaultAsync(h => h.UniqueHospitalId == uniqueId);
            if (hospital == null) return NotFound(new { success = false, message = "Hospital not found" });
            return Ok(hospital);
        }

        [HttpGet("admin/{adminContact}")]
        public async Task<IActionResult> GetByAdmin(string adminContact)
        {
            var hospital = await _db.Hospitals.FirstOrDefaultAsync(h => h.AdminContact == adminContact);
            if (hospital == null) return NotFound(new { success = false, message = "Hospital not found" });
            return Ok(hospital);
        }

        [HttpGet("staff/{hospitalId}")]
        public async Task<IActionResult> GetStaff(string hospitalId)
        {
            var staff = await _db.Users
                .Where(u => u.DoctorId == hospitalId && (u.UserType == "staff" || u.UserType == "nurse" || u.UserType == "doctor"))
                .ToListAsync();
            return Ok(staff);
        }

        [HttpPut("{uniqueId}")]
        public async Task<IActionResult> UpdateHospital(string uniqueId, [FromBody] Hospital updatedHospital)
        {
            var hospital = await _db.Hospitals.FirstOrDefaultAsync(h => h.UniqueHospitalId == uniqueId);
            if (hospital == null) return NotFound(new { success = false, message = "Hospital not found" });

            hospital.Name = updatedHospital.Name;
            hospital.Address = updatedHospital.Address;
            hospital.Phone = updatedHospital.Phone;
            hospital.Type = updatedHospital.Type;
            hospital.EmergencyEmail = updatedHospital.EmergencyEmail;
            hospital.Ventilators = updatedHospital.Ventilators;
            hospital.IcuBeds = updatedHospital.IcuBeds;
            hospital.OxygenStock = updatedHospital.OxygenStock;
            hospital.AmbulanceIds = updatedHospital.AmbulanceIds;
            hospital.Latitude = updatedHospital.Latitude;
            hospital.Longitude = updatedHospital.Longitude;

            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Hospital updated successfully", hospital = hospital });
        }
    }
}
