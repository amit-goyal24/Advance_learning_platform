using LearnHub.API.Data;
using LearnHub.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("quiz/{quizId}")]
        [Authorize]
        public async Task<IActionResult> GetQuestions(int quizId)
        {
            var questions = await _context.Questions
                .Where(q => q.QuizId == quizId)
                .Select(q => new {
                    q.Id,
                    q.QuestionText,
                    q.OptionA,
                    q.OptionB,
                    q.OptionC,
                    q.OptionD,
                    q.QuizId
                    // CorrectAnswer is omitted so students don't see it beforehand
                })
                .ToListAsync();

            return Ok(questions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            var quizExists = await _context.Quizzes.AnyAsync(q => q.Id == question.QuizId);
            if (!quizExists) return NotFound(new { Message = "Quiz not found." });

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(question);
        }
    }
}
