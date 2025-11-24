using DBLab3.DTOs;
using DBLab3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DBLab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly UniversityContext _context;

        public StudentsController(UniversityContext context)
        {
            _context = context;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var students = await _context.Students
            .Include(s => s.Group)
            .ThenInclude(g => g.Curator)
            .Select(s => new
            {
                s.Student_id,
                s.FirstName,
                s.LastName,
                s.Birth_date,
                s.Address,
                s.Group_id,
                Group = new
                {
                    s.Group.Group_id,
                    s.Group.Name,
                    s.Group.Year_start,
                    Curator = new
                    {
                        s.Group.Curator.Teacher_id,
                        s.Group.Curator.FirstName,
                        s.Group.Curator.LastName
                    }
                }
            })
            .ToListAsync();
            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var student = await _context.Students
            .Include(s => s.Group)
            .Include(s => s.Grades)
            .ThenInclude(g => g.Subject)
            .Select(s => new
            {
                s.Student_id,
                s.FirstName,
                s.LastName,
                s.Birth_date,
                s.Address,
                s.Group_id,
                Group = new
                {
                    s.Group.Group_id,
                    s.Group.Name,
                    s.Group.Year_start
                },
                Grades = s.Grades.Select(g => new
                {
                    g.Grade_id,
                    g.Subject_id,
                    g.Student_id,
                    g.Grade,
                    g.Date_grade,
                    Subject = new
                    {
                        g.Subject.Subject_id,
                        g.Subject.Name
                    }
                }).ToList()
            })
            .FirstOrDefaultAsync(s => s.Student_id == id);


            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpGet("count-by-grade-department")]
        public async Task<IActionResult> GetStudentsCountByGradeDepartment(int MinGrade, string Department)
        {
            try
            {
                using var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT dbo.GetStudentsCountByGradeAndDepartment(@MinGrade, @Department)";
                command.Parameters.Add(new SqlParameter("@MinGrade", MinGrade));
                command.Parameters.Add(new SqlParameter("@Department", Department));

                var result = await command.ExecuteScalarAsync();

                return Ok(new { result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("update-description")]
        public async Task<IActionResult> UpdateSubjectsDescription(string Department)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC dbo.UpdateSubjectsDescriptionByDepartment @Department",
                    new SqlParameter("@Department", Department));

                return Ok(new { message = "Procedure executed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("insert")]
        public async Task<IActionResult> InsertStudent(
            string FirstName,
            string LastName,
            DateTime Birth_date,
            string Address,
            int Group_id)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO Students (FirstName, LastName, Birth_date, Address, Group_id)
              VALUES (@FirstName, @LastName, @Birth_date, @Address, @Group_id)",
                    new SqlParameter("@FirstName", FirstName),
                    new SqlParameter("@LastName", LastName),
                    new SqlParameter("@Birth_date", Birth_date),
                    new SqlParameter("@Address", Address),
                    new SqlParameter("@Group_id", Group_id)
                );

                return Ok(new { message = "Student inserted" });
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

        [HttpGet("each-second-student")]
        public async Task<IActionResult> GetEachSecondStudent(int min_grades)
        {
            try
            {
                var result = await _context.Set<EachSecondStudentDto>()
                    .FromSqlRaw("SELECT * FROM fn_GetEachSecondStudent({0})", min_grades)
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
