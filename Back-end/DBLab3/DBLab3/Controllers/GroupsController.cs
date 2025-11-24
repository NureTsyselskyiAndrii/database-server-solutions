using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private readonly UniversityContext _context;
        public GroupsController(UniversityContext context) => _context = context;


        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var groups = await _context.Groups
            .Include(g => g.Curator)
            .Include(g => g.Students)
            .Select(g => new
            {
                g.Group_id,
                g.Name,
                g.Year_start,
                Curator = new
                {
                    g.Curator.Teacher_id,
                    g.Curator.FirstName,
                    g.Curator.LastName
                },
                Students = g.Students.Select(s => new
                {
                    s.Student_id,
                    s.FirstName,
                    s.LastName
                })
            })
            .ToListAsync();
            return Ok(groups);
        }
    }
}
