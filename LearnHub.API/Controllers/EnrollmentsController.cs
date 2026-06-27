using LearnHub.API.Data;
using LearnHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{courseId}")]
        public async Task<IActionResult> Enroll(int courseId)
        {
            var userIdString = User.FindFirstValue("userId");
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound(new { Message = "Course not found" });

            if (await _context.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId))
                return BadRequest(new { Message = "Already enrolled in this course." });

            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = courseId,
                EnrolledDate = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Successfully enrolled!", EnrollmentId = enrollment.Id });
        }

        [HttpGet("my-courses")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userIdString = User.FindFirstValue("userId");
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.UserId == userId)
                .Select(e => e.Course)
                .ToListAsync();

            return Ok(enrollments);
        }
    }
}
