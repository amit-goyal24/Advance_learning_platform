using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace LearnHub.API.MongoArchitecture.Models
{
    public class MongoUser
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Name")]
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = null!;

        [BsonElement("Email")]
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "Student";
    }
}
