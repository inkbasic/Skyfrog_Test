using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    /// <summary>
    /// GET /api/vehicles?search=xxx&status=Available&brand=Toyota&page=1&pageSize=10&sortBy=year&sortDirection=desc
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] VehicleQueryParams queryParams)
    {
        var result = await _vehicleService.GetAllAsync(queryParams);
        return Ok(result);
    }

    /// <summary>
    /// GET /api/vehicles/{id}
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);
        if (vehicle is null) return NotFound(new { message = "Vehicle not found." });
        return Ok(vehicle);
    }

    /// <summary>
    /// POST /api/vehicles  (multipart/form-data)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromForm] CreateVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vehicle = await _vehicleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT /api/vehicles/{id}  (multipart/form-data)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vehicle = await _vehicleService.UpdateAsync(id, dto);
            if (vehicle is null) return NotFound(new { message = "Vehicle not found." });
            return Ok(vehicle);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE /api/vehicles/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _vehicleService.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = "Vehicle not found." });
        return NoContent();
    }
}
