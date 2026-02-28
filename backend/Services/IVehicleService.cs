using Backend.DTOs;

namespace Backend.Services;

public interface IVehicleService
{
    Task<PaginatedResult<VehicleDto>> GetAllAsync(VehicleQueryParams queryParams);
    Task<VehicleDto?> GetByIdAsync(int id);
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
    Task<VehicleDto?> UpdateAsync(int id, UpdateVehicleDto dto);
    Task<bool> DeleteAsync(int id);
}
