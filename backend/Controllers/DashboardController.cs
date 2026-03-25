using Microsoft.AspNetCore.Mvc;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        // GET api/dashboard/status
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { message = "Backend is running" });
        }

        // other dashboard-related endpoints can be added here
    }
}
