namespace LearnHub.API.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledDate { get; set; }

        public User? User { get; set; }
        public Course? Course { get; set; }
    }
}
