using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Vehicle
{
    [Key]
    public int Id { get; set; }

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
    public string? EngineType { get; set; }            // Petrol, Diesel, Electric, Hybrid

    [MaxLength(30)]
    public string? FuelType { get; set; }

    public double? Mileage { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Available";  // Available, InUse, Maintenance, Retired

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
