using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

/// <summary>
/// Wrapper for paginated / filtered vehicle list responses.
/// </summary>
public class VehicleQueryParams
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Brand { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Page must be at least 1.")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "Id";
    public string SortDirection { get; set; } = "asc";
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
