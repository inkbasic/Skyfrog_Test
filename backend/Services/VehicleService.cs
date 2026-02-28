using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class VehicleService : IVehicleService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly string _uploadsFolder;

    public VehicleService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
        _uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        Directory.CreateDirectory(_uploadsFolder);
    }

    // ──────────────────────────────── GET ALL (with search / filter / pagination) ─────
    public async Task<PaginatedResult<VehicleDto>> GetAllAsync(VehicleQueryParams q)
    {
        var query = _context.Vehicles.AsQueryable();

        // Search by license plate, brand, or model
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim().ToLower();
            query = query.Where(v =>
                v.LicensePlate.ToLower().Contains(s) ||
                v.Brand.ToLower().Contains(s) ||
                v.Model.ToLower().Contains(s));
        }

        // Filter by status
        if (!string.IsNullOrWhiteSpace(q.Status))
            query = query.Where(v => v.Status == q.Status);

        // Filter by brand
        if (!string.IsNullOrWhiteSpace(q.Brand))
            query = query.Where(v => v.Brand == q.Brand);

        // Sorting
        query = q.SortBy?.ToLower() switch
        {
            "licensePlate" or "licenseplate" => q.SortDirection == "desc" ? query.OrderByDescending(v => v.LicensePlate) : query.OrderBy(v => v.LicensePlate),
            "brand"       => q.SortDirection == "desc" ? query.OrderByDescending(v => v.Brand) : query.OrderBy(v => v.Brand),
            "model"       => q.SortDirection == "desc" ? query.OrderByDescending(v => v.Model) : query.OrderBy(v => v.Model),
            "year"        => q.SortDirection == "desc" ? query.OrderByDescending(v => v.Year) : query.OrderBy(v => v.Year),
            "status"      => q.SortDirection == "desc" ? query.OrderByDescending(v => v.Status) : query.OrderBy(v => v.Status),
            "createdat"   => q.SortDirection == "desc" ? query.OrderByDescending(v => v.CreatedAt) : query.OrderBy(v => v.CreatedAt),
            _             => q.SortDirection == "desc" ? query.OrderByDescending(v => v.Id) : query.OrderBy(v => v.Id),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(v => MapToDto(v))
            .ToListAsync();

        return new PaginatedResult<VehicleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = q.Page,
            PageSize = q.PageSize
        };
    }

    // ──────────────────────────────── GET BY ID ──────────────────────────────────────
    public async Task<VehicleDto?> GetByIdAsync(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        return vehicle is null ? null : MapToDto(vehicle);
    }

    // ──────────────────────────────── CREATE ─────────────────────────────────────────
    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        // Check duplicate license plate
        if (await _context.Vehicles.AnyAsync(v => v.LicensePlate == dto.LicensePlate))
            throw new InvalidOperationException($"License plate '{dto.LicensePlate}' already exists.");

        var vehicle = new Vehicle
        {
            LicensePlate = dto.LicensePlate,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            Color = dto.Color,
            VinNumber = dto.VinNumber,
            EngineType = dto.EngineType,
            FuelType = dto.FuelType,
            Mileage = dto.Mileage,
            Status = dto.Status ?? "Available",
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Image is not null)
            vehicle.ImagePath = await SaveImageAsync(dto.Image);

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return MapToDto(vehicle);
    }

    // ──────────────────────────────── UPDATE ─────────────────────────────────────────
    public async Task<VehicleDto?> UpdateAsync(int id, UpdateVehicleDto dto)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle is null) return null;

        if (dto.LicensePlate is not null && dto.LicensePlate != vehicle.LicensePlate)
        {
            if (await _context.Vehicles.AnyAsync(v => v.LicensePlate == dto.LicensePlate && v.Id != id))
                throw new InvalidOperationException($"License plate '{dto.LicensePlate}' already exists.");
            vehicle.LicensePlate = dto.LicensePlate;
        }
        // keep original assignment pattern for other fields
        if (dto.Brand is not null)        vehicle.Brand = dto.Brand;
        if (dto.Model is not null)        vehicle.Model = dto.Model;
        if (dto.Year.HasValue)            vehicle.Year = dto.Year.Value;
        if (dto.Color is not null)        vehicle.Color = dto.Color;
        if (dto.VinNumber is not null)    vehicle.VinNumber = dto.VinNumber;
        if (dto.EngineType is not null)   vehicle.EngineType = dto.EngineType;
        if (dto.FuelType is not null)     vehicle.FuelType = dto.FuelType;
        if (dto.Mileage.HasValue)         vehicle.Mileage = dto.Mileage.Value;
        if (dto.Status is not null)       vehicle.Status = dto.Status;
        if (dto.Notes is not null)        vehicle.Notes = dto.Notes;

        if (dto.Image is not null)
        {
            // Delete old image if exists
            DeleteImageFile(vehicle.ImagePath);
            vehicle.ImagePath = await SaveImageAsync(dto.Image);
        }

        vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(vehicle);
    }

    // ──────────────────────────────── DELETE ─────────────────────────────────────────
    public async Task<bool> DeleteAsync(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle is null) return false;

        DeleteImageFile(vehicle.ImagePath);

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }

    // ──────────────────────────────── HELPERS ────────────────────────────────────────

    private async Task<string> SaveImageAsync(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(ext))
            throw new InvalidOperationException($"File type '{ext}' is not allowed. Allowed: {string.Join(", ", allowedExtensions)}");

        if (file.Length > 5 * 1024 * 1024) // 5 MB limit
            throw new InvalidOperationException("File size exceeds the 5 MB limit.");

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(_uploadsFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }

    private void DeleteImageFile(string? imagePath)
    {
        if (string.IsNullOrEmpty(imagePath)) return;

        var fullPath = Path.Combine(
            _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
            imagePath.TrimStart('/'));

        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    private static VehicleDto MapToDto(Vehicle v) => new()
    {
        Id = v.Id,
        LicensePlate = v.LicensePlate,
        Brand = v.Brand,
        Model = v.Model,
        Year = v.Year,
        Color = v.Color,
        VinNumber = v.VinNumber,
        EngineType = v.EngineType,
        FuelType = v.FuelType,
        Mileage = v.Mileage,
        Status = v.Status,
        ImageUrl = v.ImagePath,
        Notes = v.Notes,
        CreatedAt = v.CreatedAt,
        UpdatedAt = v.UpdatedAt
    };
}
