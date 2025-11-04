using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sdv_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMaestroFieldsToUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Usuarios",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Especialidad",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaNacimiento",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Modalidad",
                table: "Usuarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumeroDiplomado",
                table: "Usuarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Procedencia",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoDeCurso",
                table: "Usuarios",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Especialidad",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaNacimiento",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Modalidad",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "NumeroDiplomado",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Procedencia",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TipoDeCurso",
                table: "Usuarios");
        }
    }
}
