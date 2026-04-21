using LearnHub.API.MongoArchitecture.Models;
using LearnHub.API.MongoArchitecture.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
namespace LearnHub.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public UserController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MongoUser>>> Get()
        {
            try
            {
                var users = await _mongoService.Users.Find(_ => true).ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving users.", Details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MongoUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _mongoService.Users.InsertOneAsync(user);
                return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while creating the user.", Details = ex.Message });
            }
        }
    }
}
