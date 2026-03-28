using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebDashboardBackend.Data;
using WebDashboardBackend.Models;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AppointmentsController(AppDbContext db)
        {
            _db = db;
        }

        private static readonly HashSet<string> ValidAppointmentStatuses = new() { "Pending", "Confirmed", "Cancelled", "Completed" };
        private static readonly Dictionary<string, HashSet<string>> AllowedTransitions = new()
        {
            ["Pending"]   = new() { "Confirmed", "Cancelled" },
            ["Confirmed"] = new() { "Completed", "Cancelled" },
            ["Completed"] = new(),
            ["Cancelled"] = new(),
        };

        // ──────────────────────────────────────────────────────────────────────
        // HOSPITAL ADMIN: Enable / configure appointment booking
        // POST /api/appointments/enable-hospital
        // ──────────────────────────────────────────────────────────────────────
        [HttpPost("enable-hospital")]
        public async Task<IActionResult> EnableHospital([FromBody] EnableAppointmentRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.UniqueHospitalId))
                return BadRequest(new { success = false, message = "Hospital ID is required" });

            var hospital = await _db.Hospitals
                .FirstOrDefaultAsync(h => h.UniqueHospitalId == req.UniqueHospitalId);

            if (hospital == null)
                return NotFound(new { success = false, message = "Hospital not found" });

            hospital.AppointmentEnabled = !req.Disable;
            hospital.AppointmentSettings = req.Disable ? "{}" : req.SettingsJson;
            await _db.SaveChangesAsync();

            var msg = req.Disable ? "Appointment booking disabled" : "Appointment booking enabled";
            return Ok(new { success = true, message = msg, hospital });
        }

        // ──────────────────────────────────────────────────────────────────────
        // HOSPITAL ADMIN: Get settings for a hospital
        // GET /api/appointments/settings/{hospitalId}
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("settings/{hospitalId}")]
        public async Task<IActionResult> GetSettings(string hospitalId)
        {
            var hospital = await _db.Hospitals
                .FirstOrDefaultAsync(h => h.UniqueHospitalId == hospitalId);

            if (hospital == null)
                return Ok(new { enabled = false, settings = "{}" });

            return Ok(new
            {
                enabled = hospital.AppointmentEnabled,
                settings = hospital.AppointmentSettings ?? "{}"
            });
        }

        // ──────────────────────────────────────────────────────────────────────
        // HOSPITAL ADMIN: Get all appointments for a hospital
        // GET /api/appointments/hospital/{hospitalId}
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("hospital/{hospitalId}")]
        public async Task<IActionResult> GetHospitalAppointments(string hospitalId)
        {
            var appointments = await _db.Appointments
                .Where(a => a.UniqueHospitalId == hospitalId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(appointments);
        }

        // ──────────────────────────────────────────────────────────────────────
        // HOSPITAL ADMIN: Update appointment status
        // PUT /api/appointments/{id}/status
        // ──────────────────────────────────────────────────────────────────────
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            if (!ValidAppointmentStatuses.Contains(req.Status))
                return BadRequest(new { success = false, message = "Invalid status value" });

            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null)
                return NotFound(new { success = false, message = "Appointment not found" });

            if (!AllowedTransitions.TryGetValue(appt.Status, out var allowed) || !allowed.Contains(req.Status))
                return BadRequest(new { success = false, message = $"Cannot transition from {appt.Status} to {req.Status}" });

            appt.Status = req.Status;
            await _db.SaveChangesAsync();
            return Ok(new { success = true, appointment = appt });
        }

        // ──────────────────────────────────────────────────────────────────────
        // PATIENT: Book an appointment
        // POST /api/appointments
        // ──────────────────────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
        {
            if (string.IsNullOrWhiteSpace(appointment.PatientId) ||
                string.IsNullOrWhiteSpace(appointment.PatientName) ||
                string.IsNullOrWhiteSpace(appointment.UniqueHospitalId))
                return BadRequest(new { success = false, message = "Patient details and hospital ID are required" });

            if (appointment.AppointmentDate < DateTime.UtcNow.Date)
                return BadRequest(new { success = false, message = "Appointment date cannot be in the past" });

            var hospital = await _db.Hospitals
                .FirstOrDefaultAsync(h => h.UniqueHospitalId == appointment.UniqueHospitalId);

            if (hospital == null)
                return BadRequest(new { success = false, message = "Hospital not found in the database" });

            if (!hospital.AppointmentEnabled)
                return BadRequest(new { success = false, message = "This hospital has not enabled online appointment booking" });

            // Prevent duplicate booking: same patient, same hospital, same date
            var duplicate = await _db.Appointments.AnyAsync(a =>
                a.PatientId == appointment.PatientId &&
                a.UniqueHospitalId == appointment.UniqueHospitalId &&
                a.AppointmentDate.Date == appointment.AppointmentDate.Date &&
                a.Status != "Cancelled");

            if (duplicate)
                return Conflict(new { success = false, message = "You already have an appointment at this hospital on that date" });

            appointment.Status = "Pending";
            appointment.CreatedAt = DateTime.UtcNow;
            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Appointment booked successfully", appointment });
        }

        // ──────────────────────────────────────────────────────────────────────
        // PATIENT: Get my appointments
        // GET /api/appointments/patient/{patientId}
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetPatientAppointments(string patientId)
        {
            var appointments = await _db.Appointments
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(appointments);
        }

        // ──────────────────────────────────────────────────────────────────────
        // PUBLIC: Search appointment-enabled hospitals by name (for unlinked patients)
        // GET /api/appointments/search?q=apollo
        // ──────────────────────────────────────────────────────────────────────
        [HttpGet("search")]
        public async Task<IActionResult> SearchHospitals([FromQuery] string q = "")
        {
            if (q.Length > 100)
                return BadRequest(new { success = false, message = "Search query too long" });

            var hospitals = await _db.Hospitals
                .Where(h => h.AppointmentEnabled &&
                    (string.IsNullOrEmpty(q) || h.Name.Contains(q) || h.Address.Contains(q)))
                .Select(h => new
                {
                    h.Id,
                    h.UniqueHospitalId,
                    h.Name,
                    h.Address,
                    h.Type,
                    h.Phone,
                    h.Latitude,
                    h.Longitude
                })
                .ToListAsync();

            return Ok(hospitals);
        }
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────
    public class EnableAppointmentRequest
    {
        public string UniqueHospitalId { get; set; } = string.Empty;
        public string SettingsJson { get; set; } = "{}";
        public bool Disable { get; set; } = false;
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
