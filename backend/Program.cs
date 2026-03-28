using Microsoft.EntityFrameworkCore;
using WebDashboardBackend.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// configure database context (MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing. Configure it in appsettings.Development.json for local runs or Azure App Service settings for deployment.");

// Hardcode the version to bypass the startup "ping" crash
var serverVersion = new MySqlServerVersion(new Version(8, 0, 32)); 

builder.Services.AddDbContext<WebDashboardBackend.Data.AppDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        // This helps handle the latency between Central India and East Asia
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
});

// MVC, CORS
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// apply any pending migrations when the app starts
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WebDashboardBackend.Data.AppDbContext>();
    db.Database.Migrate();
}

// log a custom message when the application has started
app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("Web-dashboard-backend has started and is listening for requests.");
});


app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
var webRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (Directory.Exists(webRootPath))
{
    app.UseStaticFiles();
}
app.UseRouting();
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.Run();
