namespace Backend.DTOs;

/// <summary>
/// DTO returned to the client when reading vehicle data.
/// </summary>
public class VehicleDto
{
    public int Id { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Color { get; set; }
    public string? VinNumber { get; set; }
    public string? EngineType { get; set; }
    public string? FuelType { get; set; }
    public double? Mileage { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
