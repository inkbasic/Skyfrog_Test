IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(100) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [FullName] nvarchar(100) NULL,
    [Role] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [Vehicles] (
    [Id] int NOT NULL IDENTITY,
    [LicensePlate] nvarchar(50) NOT NULL,
    [Brand] nvarchar(100) NOT NULL,
    [Model] nvarchar(100) NOT NULL,
    [Year] int NOT NULL,
    [Color] nvarchar(30) NULL,
    [VinNumber] nvarchar(50) NULL,
    [EngineType] nvarchar(30) NULL,
    [FuelType] nvarchar(30) NULL,
    [Mileage] float NULL,
    [Status] nvarchar(20) NOT NULL,
    [ImagePath] nvarchar(500) NULL,
    [Notes] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Vehicles] PRIMARY KEY ([Id])
);

CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);

CREATE UNIQUE INDEX [IX_Vehicles_LicensePlate] ON [Vehicles] ([LicensePlate]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260228165444_InitialCreate', N'10.0.3');

COMMIT;
GO

