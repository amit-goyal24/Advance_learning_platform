using LearnHub.API.Data;
using LearnHub.API.DTOs;
using LearnHub.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MongoDB.Driver;

namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly LearnHub.API.MongoArchitecture.Services.MongoService _mongoService;
        private readonly IConfiguration _configuration;

        public AuthController(LearnHub.API.MongoArchitecture.Services.MongoService mongoService, IConfiguration configuration)
        {
            _mongoService = mongoService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            // Enforce Limited Data Boundaries
            if (model.Role == "Admin")
            {
                var adminCount = await _mongoService.Users.CountDocumentsAsync(u => u.Role == "Admin");
                if (adminCount >= 1)
                {
                    return BadRequest(new { Message = "Data Limit Reached: Maximum 1 Admin account is allowed." });
                }
            }
            else if (model.Role == "Student")
            {
                var studentCount = await _mongoService.Users.CountDocumentsAsync(u => u.Role == "Student");
                if (studentCount >= 10)
                {
                    return BadRequest(new { Message = "Data Limit Reached: Maximum 10 Student accounts are allowed." });
                }
            }

            var existingUser = await _mongoService.Users.Find(u => u.Email == model.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest(new { Message = "User with this email already exists." });
            }

            var user = new LearnHub.API.MongoArchitecture.Models.MongoUser
            {
                Name = model.FullName,
                Email = model.Email,
                Role = model.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password) 
            };

            await _mongoService.Users.InsertOneAsync(user);

            return Ok(new { Message = "User registered successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _mongoService.Users.Find(u => u.Email == model.Email).SingleOrDefaultAsync();
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, Role = user.Role, FullName = user.Name });
        }

        private string GenerateJwtToken(LearnHub.API.MongoArchitecture.Models.MongoUser user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings["Key"]!));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", user.Id!.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(120),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
