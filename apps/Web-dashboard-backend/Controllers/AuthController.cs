using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using WebDashboardBackend.Models;
using WebDashboardBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Account created successfully", user = user });
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
            return Ok(new { success = true, message = "Signed in successfully", user = new { user.Id, user.Username, user.Email, user.UserType } });
        }

        [HttpGet("status")]
        public IActionResult Status() => Ok(new { message = "Auth service up" });
    }
}