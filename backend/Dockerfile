# ── Backend Dockerfile ──
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# สร้างโฟลเดอร์ uploads
RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "backend.dll"]
