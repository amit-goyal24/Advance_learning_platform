namespace LearnHub.API.DTOs
{
    public class RegisterDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; } // "Student" or "Admin"
    }

    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
