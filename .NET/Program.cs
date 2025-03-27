using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MvcFilm.Data;
using MvcMovie.Data;

var builder = WebApplication.CreateBuilder(args);

// Add DbContexts to the container with transient error resiliency.
builder.Services.AddDbContext<MvcTextContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("MvcTextContext") ?? throw new InvalidOperationException("Connection string 'MvcTextContext' not found.")
    ));

builder.Services.AddDbContext<MvcMovieContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("MvcMovieContext") ?? throw new InvalidOperationException("Connection string 'MvcMovieContext' not found.")
    ));

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
