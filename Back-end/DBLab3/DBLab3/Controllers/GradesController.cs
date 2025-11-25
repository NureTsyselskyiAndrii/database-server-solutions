using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradesController : ControllerBase
    {
        private readonly UniversityContext _context;
        public GradesController(UniversityContext context) => _context = context;


        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var grades = await _context.Grades
            .Include(g => g.Student)
            .Include(g => g.Subject)
            .ThenInclude(s => s.Teacher)
            .Select(g => new
            {
                g.Grade_id,
                g.Student_id,
                g.Subject_id,
                g.Grade,
                g.Date_grade,
                Student = new
                {
                    g.Student.Student_id,
                    g.Student.FirstName,
                    g.Student.LastName,
                },
                Subject = new
                {
                    g.Subject.Subject_id,
                    g.Subject.Name,
                    Teacher = new
                    {
                        g.Subject.Teacher.Teacher_id,
                        g.Subject.Teacher.FirstName,
                        g.Subject.Teacher.LastName
                    }
                }
            })
            .ToListAsync();
            return Ok(grades);
        }

        [HttpGet("less-than-avg")]
        public async Task<IActionResult> GetLessThanAvg()
        {
            try
            {
                using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT dbo.LESS_THAN_AVG()";

                var result = await command.ExecuteScalarAsync();

                return Ok(new { count = (int)result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("count-below")]
        public async Task<IActionResult> GetCountBelow(int limit)
        {
            try
            {
                using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT dbo.COUNT_GRADES_BELOW(@limit)";
                command.Parameters.Add(new SqlParameter("@limit", limit));

                var result = await command.ExecuteScalarAsync();

                return Ok(new { count = (int)result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddGrade(int Student_id, int Subject_id, int Grade)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC usp_add_grade @Student_id, @Subject_id, @Grade",
                    new SqlParameter("@Student_id", Student_id),
                    new SqlParameter("@Subject_id", Subject_id),
                    new SqlParameter("@Grade", Grade)
                );

                return Ok(new { message = "Procedure executed" });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { sql_error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPut("update-grade/{id}")]
        public async Task<IActionResult> UpdateGrade(int id, int newValue)
        {
            try
            {
                var grade = await _context.Grades.FindAsync(id);
                if (grade == null)
                    return NotFound(new { error = "Grade not found" });

                grade.Grade = newValue;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Grade updated", newValue });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("insert")]
        public async Task<IActionResult> InsertGrade(
            int Student_id,
            int Subject_id,
            int Grade)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO Grades (Student_id, Subject_id, Grade, Date_grade)
              VALUES (@Student_id, @Subject_id, @Grade, @Date_grade)",
                    new SqlParameter("@Student_id", Student_id),
                    new SqlParameter("@Subject_id", Subject_id),
                    new SqlParameter("@Grade", Grade),
                    new SqlParameter("@Date_grade", DateTime.Now)
                );

                return Ok(new { message = "Grade inserted" });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { sql_error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
