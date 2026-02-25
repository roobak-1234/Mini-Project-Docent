using Microsoft.AspNetCore.Mvc;
using WebDashboardBackend.Models;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AmbulanceController : ControllerBase
    {
        // GET api/ambulance/status
        [HttpGet("status")]
        public IActionResult GetAmbulanceStatus()
        {
            // return dummy status for now
            var status = new AmbulanceStatus { Id = 1, Location = "37.7749,-122.4194", Available = true };
            return Ok(status);
        }

        // other ambulance-related endpoints (e.g., location updates) can be added
    }
}