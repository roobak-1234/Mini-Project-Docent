using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebDashboardBackend.Data;
using WebDashboardBackend.Models;
using System.ComponentModel.DataAnnotations;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveController : ControllerBase
    {
        private readonly AppDbContext _db;
        private static readonly HashSet<string> ValidStatuses = new() { "Approved", "Rejected" };

        public LeaveController(AppDbContext db)
        {
            _db = db;
        }

        private async Task<bool> IsAdminUser(string username)
        {
            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username == username);
            return user != null &&
                   (user.UserType == "doctor" || user.StaffType == "Administrator");
        }

        [HttpPost("Apply")]
        public async Task<IActionResult> Apply([FromBody] ApplyLeaveRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request data" });

            if (!DateTime.TryParse(req.StartDate, out var start) || !DateTime.TryParse(req.EndDate, out var end))
                return BadRequest(new { success = false, message = "Invalid date format" });

            if (end < start)
                return BadRequest(new { success = false, message = "End date cannot be before start date" });

            // Verify the applicant exists
            var applicant = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username == req.Username);
            if (applicant == null)
                return BadRequest(new { success = false, message = "User not found" });

            var leave = new LeaveApplication
            {
                Username = req.Username.Trim(),
                StaffType = req.StaffType.Trim(),
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                Reason = req.Reason.Trim(),
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.ToString("O")
            };

            _db.LeaveApplications.Add(leave);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, leave });
        }

        [HttpGet("MyLeaves/{username}")]
        public async Task<IActionResult> MyLeaves(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { success = false, message = "Username is required" });

            var leaves = await _db.LeaveApplications
                .Where(l => l.Username == username)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("Pending")]
        public async Task<IActionResult> Pending([FromQuery] string requester = "")
        {
            if (string.IsNullOrWhiteSpace(requester) || !await IsAdminUser(requester))
                return Forbid();

            var leaves = await _db.LeaveApplications
                .Where(l => l.Status == "Pending")
                .OrderBy(l => l.CreatedAt)
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("All")]
        public async Task<IActionResult> All([FromQuery] string requester = "")
        {
            if (string.IsNullOrWhiteSpace(requester) || !await IsAdminUser(requester))
                return Forbid();

            var leaves = await _db.LeaveApplications
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpPut("Review/{id}")]
        public async Task<IActionResult> Review(int id, [FromBody] ReviewRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request data" });

            if (!ValidStatuses.Contains(req.Status))
                return BadRequest(new { success = false, message = "Status must be 'Approved' or 'Rejected'" });

            if (!await IsAdminUser(req.Reviewer))
                return Forbid();

            var leave = await _db.LeaveApplications.FindAsync(id);
            if (leave == null)
                return NotFound(new { success = false, message = "Leave application not found" });

            if (leave.Status != "Pending")
                return BadRequest(new { success = false, message = "Only pending applications can be reviewed" });

            leave.Status = req.Status;
            leave.ApprovedBy = req.Reviewer.Trim();
            leave.Comments = req.Comments?.Trim();
            await _db.SaveChangesAsync();

            return Ok(new { success = true, leave });
        }
    }

    public class ApplyLeaveRequest
    {
        [Required, MinLength(1)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(1)]
        public string StaffType { get; set; } = string.Empty;

        [Required]
        public string StartDate { get; set; } = string.Empty;

        [Required]
        public string EndDate { get; set; } = string.Empty;

        [Required, MinLength(5), MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;
    }

    public class ReviewRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        [Required, MinLength(1)]
        public string Reviewer { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Comments { get; set; }
    }
}
