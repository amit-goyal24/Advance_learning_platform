using LearnHub.API.MongoArchitecture.Models;
using LearnHub.API.MongoArchitecture.Repositories;

namespace LearnHub.API.MongoArchitecture.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<List<MongoUser>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task CreateUserAsync(MongoUser user)
        {
            await _userRepository.CreateAsync(user);
        }
    }
}
