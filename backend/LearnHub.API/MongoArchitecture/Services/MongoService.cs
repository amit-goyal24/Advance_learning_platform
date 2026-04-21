using MongoDB.Driver;
using Microsoft.Extensions.Options;
using LearnHub.API.MongoArchitecture.Config;
using LearnHub.API.MongoArchitecture.Models;

namespace LearnHub.API.MongoArchitecture.Services
{
    public class MongoService
    {
        private readonly IMongoDatabase _database;

        public MongoService(IOptions<MongoSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        // We use MongoUser to avoid conflicts with your EF Core User model
        public IMongoCollection<MongoUser> Users =>
            _database.GetCollection<MongoUser>("users");
    }
}
