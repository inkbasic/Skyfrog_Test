using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

/// <summary>
/// DTO for updating an existing vehicle (multipart form data with optional image).
/// </summary>
public class UpdateVehicleDto
{
    [MaxLength(50)]
    public string? LicensePlate { get; set; }

    [MaxLength(100)]
    public string? Brand { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    [Range(1900, 2100)]
    public int? Year { get; set; }

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
    /// Optional replacement image. If provided, the old image is deleted.
    /// </summary>
    public IFormFile? Image { get; set; }
}
