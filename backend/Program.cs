using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173",
                                              "http://localhost:5174")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize all DateTime as UTC with 'Z' suffix so JS can convert timezone correctly
        options.JsonSerializerOptions.Converters.Add(new Backend.Converters.UtcDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new Backend.Converters.NullableUtcDateTimeConverter());
    });

// ── EF Core ───────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? "SuperSecretDevKey_ChangeInProduction_32+";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"] ?? "FleetCarAPI",
        ValidAudience = jwtSection["Audience"] ?? "FleetCarClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// ── Auto-Migrate Database ──────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // ── Seed Mock Data (25 vehicles) ──
    if (!db.Vehicles.Any())
    {
        var vehicles = new List<Vehicle>
        {
            new() { LicensePlate = "กข-1234", Brand = "Toyota", Model = "Camry", Year = 2024, Color = "White", EngineType = "Petrol", FuelType = "Benzine", Mileage = 15200, Status = "Available", Notes = "รถผู้บริหาร สภาพดี", CreatedAt = DateTime.UtcNow.AddDays(-60) },
            new() { LicensePlate = "ขค-5678", Brand = "Honda", Model = "Civic", Year = 2025, Color = "Silver", EngineType = "Petrol", FuelType = "Benzine", Mileage = 3400, Status = "InUse", Notes = "ใช้ประจำฝ่ายขาย", CreatedAt = DateTime.UtcNow.AddDays(-55) },
            new() { LicensePlate = "คง-9012", Brand = "Toyota", Model = "Hilux Revo", Year = 2023, Color = "Black", EngineType = "Diesel", FuelType = "Diesel", Mileage = 45800, Status = "Available", Notes = "กระบะขนส่ง", CreatedAt = DateTime.UtcNow.AddDays(-50) },
            new() { LicensePlate = "งจ-3456", Brand = "Isuzu", Model = "D-Max", Year = 2022, Color = "Blue", EngineType = "Diesel", FuelType = "Diesel", Mileage = 78500, Status = "InUse", Notes = "ใช้งานภาคสนาม", CreatedAt = DateTime.UtcNow.AddDays(-48) },
            new() { LicensePlate = "จฉ-7890", Brand = "Mitsubishi", Model = "Pajero Sport", Year = 2024, Color = "White", EngineType = "Diesel", FuelType = "Diesel", Mileage = 12300, Status = "Available", Notes = "SUV สำหรับผู้จัดการ", CreatedAt = DateTime.UtcNow.AddDays(-45) },
            new() { LicensePlate = "ฉช-1122", Brand = "Tesla", Model = "Model 3", Year = 2025, Color = "Red", EngineType = "Electric", FuelType = "Electric", Mileage = 8900, Status = "InUse", Notes = "รถ EV ประจำสำนักงาน", CreatedAt = DateTime.UtcNow.AddDays(-42) },
            new() { LicensePlate = "ชซ-3344", Brand = "BYD", Model = "Atto 3", Year = 2024, Color = "Gray", EngineType = "Electric", FuelType = "Electric", Mileage = 21000, Status = "Available", Notes = "รถพลังงานไฟฟ้า", CreatedAt = DateTime.UtcNow.AddDays(-40) },
            new() { LicensePlate = "ซฌ-5566", Brand = "Mazda", Model = "CX-5", Year = 2023, Color = "Red", EngineType = "Petrol", FuelType = "Benzine", Mileage = 34500, Status = "Maintenance", Notes = "อยู่ระหว่างเช็คระยะ 30,000 km", CreatedAt = DateTime.UtcNow.AddDays(-38) },
            new() { LicensePlate = "ฌญ-7788", Brand = "Nissan", Model = "Kicks", Year = 2024, Color = "Orange", EngineType = "Hybrid", FuelType = "Hybrid", Mileage = 11200, Status = "Available", Notes = "e-POWER Hybrid", CreatedAt = DateTime.UtcNow.AddDays(-35) },
            new() { LicensePlate = "ญฎ-9900", Brand = "MG", Model = "ZS", Year = 2023, Color = "White", EngineType = "Petrol", FuelType = "Benzine", Mileage = 29800, Status = "InUse", Notes = "ฝ่ายการตลาด", CreatedAt = DateTime.UtcNow.AddDays(-33) },
            new() { LicensePlate = "ฎฏ-2233", Brand = "Ford", Model = "Ranger", Year = 2022, Color = "Blue", EngineType = "Diesel", FuelType = "Diesel", Mileage = 67300, Status = "Available", Notes = "กระบะ 4 ประตู", CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { LicensePlate = "ฏฐ-4455", Brand = "Hyundai", Model = "Ioniq 5", Year = 2025, Color = "Green", EngineType = "Electric", FuelType = "Electric", Mileage = 5600, Status = "InUse", Notes = "รถ EV รุ่นใหม่", CreatedAt = DateTime.UtcNow.AddDays(-28) },
            new() { LicensePlate = "ฐฑ-6677", Brand = "Toyota", Model = "Fortuner", Year = 2023, Color = "Bronze", EngineType = "Diesel", FuelType = "Diesel", Mileage = 52100, Status = "Available", Notes = "SUV ขนาดใหญ่", CreatedAt = DateTime.UtcNow.AddDays(-25) },
            new() { LicensePlate = "ฑฒ-8899", Brand = "Honda", Model = "CR-V", Year = 2024, Color = "Black", EngineType = "Hybrid", FuelType = "Hybrid", Mileage = 18700, Status = "Maintenance", Notes = "เปลี่ยนยาง + เช็คเบรก", CreatedAt = DateTime.UtcNow.AddDays(-22) },
            new() { LicensePlate = "ฒณ-1010", Brand = "Kia", Model = "EV6", Year = 2025, Color = "Silver", EngineType = "Electric", FuelType = "Electric", Mileage = 4200, Status = "Available", Notes = "รถ EV สมรรถนะสูง", CreatedAt = DateTime.UtcNow.AddDays(-20) },
            new() { LicensePlate = "ณด-2020", Brand = "Suzuki", Model = "Swift", Year = 2023, Color = "Yellow", EngineType = "Petrol", FuelType = "Benzine", Mileage = 31400, Status = "InUse", Notes = "รถขนาดเล็ก ประหยัดน้ำมัน", CreatedAt = DateTime.UtcNow.AddDays(-18) },
            new() { LicensePlate = "ดต-3030", Brand = "Volvo", Model = "XC60", Year = 2024, Color = "Dark Blue", EngineType = "Plug-in Hybrid", FuelType = "Hybrid", Mileage = 14500, Status = "Available", Notes = "รถ PHEV ระดับพรีเมียม", CreatedAt = DateTime.UtcNow.AddDays(-16) },
            new() { LicensePlate = "ตถ-4040", Brand = "BMW", Model = "X3", Year = 2023, Color = "White", EngineType = "Petrol", FuelType = "Benzine", Mileage = 27800, Status = "Retired", Notes = "ปลดระวาง — ครบอายุสัญญาเช่า", CreatedAt = DateTime.UtcNow.AddDays(-14) },
            new() { LicensePlate = "ถท-5050", Brand = "Mercedes-Benz", Model = "C-Class", Year = 2024, Color = "Black", EngineType = "Petrol", FuelType = "Benzine", Mileage = 9800, Status = "InUse", Notes = "รถประจำตำแหน่ง CEO", CreatedAt = DateTime.UtcNow.AddDays(-12) },
            new() { LicensePlate = "ทธ-6060", Brand = "GWM", Model = "Haval H6", Year = 2024, Color = "Gray", EngineType = "Hybrid", FuelType = "Hybrid", Mileage = 16900, Status = "Available", Notes = "HEV SUV คุ้มค่า", CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new() { LicensePlate = "ธน-7070", Brand = "Neta", Model = "Neta V-II", Year = 2025, Color = "White", EngineType = "Electric", FuelType = "Electric", Mileage = 2100, Status = "Available", Notes = "EV ราคาประหยัด", CreatedAt = DateTime.UtcNow.AddDays(-9) },
            new() { LicensePlate = "นบ-8080", Brand = "Toyota", Model = "Corolla Cross", Year = 2024, Color = "Silver", EngineType = "Hybrid", FuelType = "Hybrid", Mileage = 22400, Status = "InUse", Notes = "Hybrid ประจำฝ่าย HR", CreatedAt = DateTime.UtcNow.AddDays(-7) },
            new() { LicensePlate = "บป-9090", Brand = "Mitsubishi", Model = "Xpander", Year = 2023, Color = "Brown", EngineType = "Petrol", FuelType = "Benzine", Mileage = 38600, Status = "Maintenance", Notes = "เปลี่ยนน้ำมันเครื่อง + กรอง", CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new() { LicensePlate = "ปผ-1515", Brand = "Isuzu", Model = "MU-X", Year = 2024, Color = "Gold", EngineType = "Diesel", FuelType = "Diesel", Mileage = 19300, Status = "InUse", Notes = "SUV ดีเซล ฝ่ายปฏิบัติการ", CreatedAt = DateTime.UtcNow.AddDays(-3) },
            new() { LicensePlate = "ผฝ-2525", Brand = "BYD", Model = "Seal", Year = 2025, Color = "Blue", EngineType = "Electric", FuelType = "Electric", Mileage = 1500, Status = "Available", Notes = "EV ซีดานรุ่นใหม่ล่าสุด", CreatedAt = DateTime.UtcNow.AddDays(-1) },
        };
        db.Vehicles.AddRange(vehicles);
        db.SaveChanges();
    }
}

// ── Middleware Pipeline ───────────────────────────────────────────────────────
app.UseMiddleware<Backend.Middleware.GlobalExceptionMiddleware>();
app.UseCors(MyAllowSpecificOrigins);

app.UseStaticFiles();          // Serve wwwroot/uploads images

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
