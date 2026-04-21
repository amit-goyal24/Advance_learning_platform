using LearnHub.API.MongoArchitecture.Config;
using LearnHub.API.MongoArchitecture.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace LearnHub.API.MongoArchitecture.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<MongoUser> _usersCollection;

        public UserRepository(IOptions<MongoSettings> mongoSettings)
        {
            var mongoClient = new MongoClient(mongoSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<MongoUser>("users");
        }

        public async Task<List<MongoUser>> GetAllAsync() =>
            await _usersCollection.Find(_ => true).ToListAsync();

        public async Task CreateAsync(MongoUser user) =>
            await _usersCollection.InsertOneAsync(user);
    }
}
