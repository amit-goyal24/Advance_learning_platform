namespace LearnHub.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string Role { get; set; } // "Student" or "Admin"
        
        public ICollection<Enrollment>? Enrollments { get; set; }
        public ICollection<Result>? Results { get; set; }
    }
}
