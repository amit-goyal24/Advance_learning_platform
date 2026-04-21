using LearnHub.API.MongoArchitecture.Models;

namespace LearnHub.API.MongoArchitecture.Repositories
{
    public interface IUserRepository
    {
        Task<List<MongoUser>> GetAllAsync();
        Task CreateAsync(MongoUser user);
    }
}
