namespace LearnHub.API.Models
{
    public class Result
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public int? QuizId { get; set; }
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime AttemptedDate { get; set; }

        public User? User { get; set; }
        public Course? Course { get; set; }
    }
}
