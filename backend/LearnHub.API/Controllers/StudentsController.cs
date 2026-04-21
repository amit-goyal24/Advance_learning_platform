using LearnHub.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    EnrolledCourses = _context.Enrollments
                        .Where(e => e.UserId == u.Id)
                        .Select(e => new
                        {
                            e.CourseId,
                            CourseName = e.Course != null ? e.Course.Title : "Unknown",
                            e.EnrolledDate
                        }).ToList(),
                    QuizAttempts = _context.Results
                        .Where(r => r.UserId == u.Id)
                        .Count(),
                    AvgScore = _context.Results
                        .Where(r => r.UserId == u.Id && r.TotalQuestions > 0)
                        .Any()
                        ? Math.Round(_context.Results
                            .Where(r => r.UserId == u.Id && r.TotalQuestions > 0)
                            .Average(r => (double)r.Score / r.TotalQuestions * 100))
                        : 0
                })
                .OrderBy(u => u.Name)
                .ToListAsync();

            return Ok(students);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStudentDetail(int id)
        {
            var student = await _context.Users
                .Where(u => u.Id == id && u.Role == "Student")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    Enrollments = _context.Enrollments
                        .Where(e => e.UserId == u.Id)
                        .Select(e => new
                        {
                            e.CourseId,
                            CourseName = e.Course != null ? e.Course.Title : "Unknown",
                            e.EnrolledDate
                        }).ToList(),
                    Results = _context.Results
                        .Where(r => r.UserId == u.Id)
                        .Select(r => new
                        {
                            r.Id,
                            CourseName = r.Course != null ? r.Course.Title : "Unknown",
                            r.Score,
                            r.TotalQuestions,
                            Percentage = r.TotalQuestions > 0 ? Math.Round((double)r.Score / r.TotalQuestions * 100) : 0,
                            r.AttemptedDate
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (student == null) return NotFound(new { Message = "Student not found." });

            return Ok(student);
        }
    }
}
