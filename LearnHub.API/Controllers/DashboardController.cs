using LearnHub.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalStudents = await _context.Users.CountAsync(u => u.Role == "Student");
            var totalCourses = await _context.Courses.CountAsync();
            var totalEnrollments = await _context.Enrollments.CountAsync();

            return Ok(new
            {
                TotalStudents = totalStudents,
                TotalCourses = totalCourses,
                TotalEnrollments = totalEnrollments
            });
        }
    }
}
