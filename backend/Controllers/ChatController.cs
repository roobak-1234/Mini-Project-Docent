using Microsoft.AspNetCore.Mvc;
using WebDashboardBackend.Models;

namespace WebDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        // GET api/chat/messages
        [HttpGet("messages")]
        public IActionResult GetMessages()
        {
            // placeholder: return static list or pull from DB/service
            var messages = new[] { new Models.ChatMessage { User = "Alice", Text = "Hello" } };
            return Ok(messages);
        }

        // POST api/chat/messages
        [HttpPost("messages")]
        public IActionResult PostMessage([FromBody] Models.ChatMessage message)
        {
            // placeholder: persist message
            return Created(string.Empty, message);
        }
    }
}