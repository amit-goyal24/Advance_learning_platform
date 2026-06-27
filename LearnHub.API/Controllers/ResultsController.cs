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
    public class ResultsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResultsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("submit/{quizId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitQuiz(int quizId, [FromBody] Dictionary<string, string> answers)
        {
            var userIdString = User.FindFirstValue("userId");
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId);
            if (quiz == null) return NotFound(new { Message = "Quiz not found." });

            var questions = await _context.Questions.Where(q => q.QuizId == quizId).ToListAsync();
            if (!questions.Any()) return BadRequest(new { Message = "No questions found for this quiz." });

            int score = 0;
            var questionFeedback = new List<object>();


            foreach (var question in questions)
            {
                var normalizedCorrect = question.CorrectAnswer?.Replace("Option ", "", StringComparison.OrdinalIgnoreCase).Trim() ?? "";
                var studentAnswer = answers.TryGetValue(question.Id.ToString(), out var ans) ? ans : null;
                var isCorrect = studentAnswer != null && studentAnswer.Equals(normalizedCorrect, StringComparison.OrdinalIgnoreCase);

                if (isCorrect) score++;

                questionFeedback.Add(new
                {
                    QuestionId = question.Id,
                    QuestionText = question.QuestionText,
                    OptionA = question.OptionA,
                    OptionB = question.OptionB,
                    OptionC = question.OptionC,
                    OptionD = question.OptionD,
                    CorrectAnswer = normalizedCorrect,
                    StudentAnswer = studentAnswer ?? "",
                    IsCorrect = isCorrect
                });
            }

            // Check if already attempted - if so, update the existing result
            var existingResult = await _context.Results.FirstOrDefaultAsync(r => r.UserId == userId && r.QuizId == quizId);
            if (existingResult != null)
            {
                existingResult.Score = score;
                existingResult.TotalQuestions = questions.Count;
                existingResult.AttemptedDate = DateTime.UtcNow;
            }
            else
            {
                var result = new Result
                {
                    UserId = userId,
                    CourseId = quiz.CourseId,
                    QuizId = quizId,
                    Score = score,
                    TotalQuestions = questions.Count,
                    AttemptedDate = DateTime.UtcNow
                };
                _context.Results.Add(result);
            }

            await _context.SaveChangesAsync();

            var passRate = questions.Count > 0 ? Math.Round((double)score / questions.Count * 100) : 0;

            return Ok(new
            {
                Message = "Quiz submitted successfully!",
                Score = score,
                Total = questions.Count,
                PassRate = passRate,
                Questions = questionFeedback
            });
        }

        [HttpGet("my-results")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyResults()
        {
            var userIdString = User.FindFirstValue("userId");
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var results = await _context.Results
                .Include(r => r.Course)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllResults()
        {
            var results = await _context.Results
                .Include(r => r.User)
                .Include(r => r.Course)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    StudentName = r.User != null ? r.User.Name : "Unknown",
                    StudentEmail = r.User != null ? r.User.Email : "",
                    r.CourseId,
                    CourseName = r.Course != null ? r.Course.Title : "Unknown Course",
                    r.QuizId,
                    r.Score,
                    r.TotalQuestions,
                    Percentage = r.TotalQuestions > 0 ? Math.Round((double)r.Score / r.TotalQuestions * 100) : 0,
                    r.AttemptedDate
                })
                .OrderByDescending(r => r.AttemptedDate)
                .ToListAsync();

            return Ok(results);
        }
    }
}
