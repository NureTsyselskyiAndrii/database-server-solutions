using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectsController : ControllerBase
    {
        private readonly UniversityContext _context;
        public SubjectsController(UniversityContext context) => _context = context;


        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var subs = await _context.Subjects
            .Include(s => s.Teacher)
            .Select(s => new
            {
                s.Subject_id,
                s.Name,
                s.Hours,
                s.Description,
                s.Teacher_id,
                Teacher = new
                {
                    s.Teacher.Teacher_id,
                    s.Teacher.FirstName,
                    s.Teacher.LastName
                }
            })
            .ToListAsync();
            return Ok(subs);
        }
    }
}
