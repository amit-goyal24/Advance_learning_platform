namespace LearnHub.API.Models
{
    public class Quiz
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public int CourseId { get; set; }
        
        public Course? Course { get; set; }
        public ICollection<Question>? Questions { get; set; }
    }
}
