using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogsController : ControllerBase
    {
        private readonly UniversityContext _context;
        public LogsController(UniversityContext context)
        {
            _context = context;
        }

        [HttpGet("get-all-block-logs")]
        public async Task<IActionResult> GetAllBlockLogs()
        {
            var list = await _context.BlockLogs.ToListAsync();
            return Ok(list);
        }

        [HttpGet("get-all-grades-logs")]
        public async Task<IActionResult> GetAllGradesLogs()
        {
            var list = await _context.GradesLogs.ToListAsync();
            return Ok(list);
        }
    }
}
