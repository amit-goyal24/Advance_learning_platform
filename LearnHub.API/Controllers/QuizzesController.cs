using LearnHub.API.Data;
using LearnHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizzesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.CourseId == courseId)
                .Select(q => new {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.CourseId,
                    QuestionCount = _context.Questions.Count(question => question.QuizId == q.Id)
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetQuiz(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null) return NotFound();
            return Ok(quiz);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateQuiz([FromBody] Quiz quiz)
        {
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == quiz.CourseId);
            if (!courseExists) return BadRequest(new { Message = "Course not found." });

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();
            return Ok(quiz);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] Quiz updatedQuiz)
        {
            if (id != updatedQuiz.Id) return BadRequest();

            _context.Entry(updatedQuiz).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Quizzes.AnyAsync(q => q.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null) return NotFound();

            // Optional: load questions and remove them, but EF Core does cascade delete by default 
            // if configured or if using required foreign keys.
            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Quiz deleted successfully." });
        }
    }
}
