using DBLab3.DTOs;
using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeachersController : ControllerBase
    {
        private readonly UniversityContext _context;
        public TeachersController(UniversityContext context)
        {
            _context = context;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Teachers
                .Include(t => t.Subjects)
                .Include(t => t.Groups)
                .Select(t => new
                {
                    t.Teacher_id,
                    t.FirstName,
                    t.LastName,
                    t.Department,
                    t.Position,
                    t.Phone,
                    Subjects = t.Subjects.Select(s => new
                    {
                        s.Subject_id,
                        s.Name,
                        s.Hours,
                        s.Description
                    }),
                    Groups = t.Groups.Select(g => new
                    {
                        g.Group_id,
                        g.Name,
                        g.Year_start
                    })
                })
                .ToListAsync();
            return Ok(list);
        }

        [HttpPost("insert")]
        public async Task<IActionResult> InsertTeacher(string FirstName, string LastName, string Department, string Position, string Phone)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC usp_insert_teacher @FirstName, @LastName, @Department, @Position, @Phone",
                    new SqlParameter("@FirstName", FirstName),
                    new SqlParameter("@LastName", LastName),
                    new SqlParameter("@Department", Department),
                    new SqlParameter("@Position", Position),
                    new SqlParameter("@Phone", Phone)
                );

                return Ok(new { message = "Teacher inserted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("teachers-below-k")]
        public async Task<IActionResult> GetEveryITeacherBelowK(int i_step, int k_sum)
        {
            try
            {
                var result = await _context.Set<EveryITeacherBelowKDto>()
                    .FromSqlRaw("SELECT * FROM fn_GetEveryITeacherBelowK({0}, {1})", i_step, k_sum)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
