using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sdv_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNumeroDiplomadoToAlumnos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumeroDiplomado",
                table: "Alumnos",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroDiplomado",
                table: "Alumnos");
        }
    }
}
