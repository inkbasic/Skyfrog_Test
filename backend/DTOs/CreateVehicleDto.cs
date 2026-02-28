using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

/// <summary>
/// DTO for creating a new vehicle (multipart form data with optional image).
/// </summary>
public class CreateVehicleDto
{
    [Required, MaxLength(50)]
    public string LicensePlate { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100)]
    public int Year { get; set; }

    [MaxLength(30)]
    public string? Color { get; set; }

    [MaxLength(50)]
    public string? VinNumber { get; set; }

    [MaxLength(30)]
    public string? EngineType { get; set; }

    [MaxLength(30)]
    public string? FuelType { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Mileage must be a positive number.")]
    public double? Mileage { get; set; }

    [MaxLength(20)]
    [RegularExpression("^(Available|InUse|Maintenance|Retired)$", ErrorMessage = "Status must be one of: Available, InUse, Maintenance, Retired.")]
    public string? Status { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    /// <summary>
    /// Optional vehicle image file.
    /// </summary>
    public IFormFile? Image { get; set; }
}
