using Microsoft.AspNetCore.Mvc;
using WebDashboardBackend.Models;
using WebDashboardBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("[controller]")]
    [Route("api/api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] User user)
        {
            if (await _db.Users.AnyAsync(u => u.Username == user.Username || u.Email == user.Email))
            {
                return Conflict(new { success = false, message = "Username or email already exists" });
            }
            user.Id = Guid.NewGuid().ToString();

            if (user.UserType == "doctor" && string.IsNullOrEmpty(user.UniqueDoctorId))
            {
                var random = new Random();
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString().Substring(6);
                var randNum = random.Next(100, 999).ToString();
                user.UniqueDoctorId = $"DR-{timestamp}-{randNum}";
            }

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            var resultUser = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
            if (resultUser != null) resultUser.Password = string.Empty;
            
            return Ok(new { success = true, message = "Account created successfully", user = resultUser });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> Signin([FromBody] User credentials)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u =>
                (u.Username == credentials.Username || u.Email == credentials.Username)
                && u.Password == credentials.Password);
            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }
            
            // Set online status
            user.IsOnline = true;
            await _db.SaveChangesAsync();
            
            // Omit password from response
            user.Password = string.Empty;
            
            return Ok(new { success = true, message = "Signed in successfully", user = user });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] User resetReq)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == resetReq.Username && u.UserType == resetReq.UserType);
            if (user == null) return NotFound(new { success = false, message = "User not found" });

            user.Password = resetReq.Password;
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Password reset successfully" });
        }

        [HttpGet("patients/{doctorId}")]
        public async Task<IActionResult> GetPatientsByDoctor(string doctorId)
        {
            var patients = await _db.Users
                .Where(u => u.DoctorId == doctorId && u.UserType == "patient")
                .ToListAsync();
            
            // Omit passwords
            foreach(var p in patients) p.Password = string.Empty;
            
            return Ok(patients);
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _db.Users
                .Where(u => u.UserType == "doctor")
                .ToListAsync();
            
            foreach (var d in doctors) d.Password = string.Empty;
            return Ok(doctors);
        }

        [HttpDelete("user/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { success = false, message = "User not found" });

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "User deleted successfully" });
        }

        [HttpGet("status")]
        public IActionResult Status() => Ok(new { message = "Auth service up" });
    }
}