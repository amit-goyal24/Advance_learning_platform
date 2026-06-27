namespace LearnHub.API.Models
{
    public class Course
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Duration { get; set; }
        public required string InstructorName { get; set; }
        
        public ICollection<Enrollment>? Enrollments { get; set; }
    }
}
