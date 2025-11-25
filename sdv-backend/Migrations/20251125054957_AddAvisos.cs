using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sdv_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAvisos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Avisos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    UsuarioCreadorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avisos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Avisos_Usuarios_UsuarioCreadorId",
                        column: x => x.UsuarioCreadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AvisoDestinatarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AvisoId = table.Column<int>(type: "int", nullable: false),
                    MaestroId = table.Column<int>(type: "int", nullable: false),
                    Leido = table.Column<bool>(type: "bit", nullable: false),
                    FechaLectura = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AvisoDestinatarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AvisoDestinatarios_Avisos_AvisoId",
                        column: x => x.AvisoId,
                        principalTable: "Avisos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AvisoDestinatarios_Usuarios_MaestroId",
                        column: x => x.MaestroId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AvisoDestinatarios_AvisoId_MaestroId",
                table: "AvisoDestinatarios",
                columns: new[] { "AvisoId", "MaestroId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AvisoDestinatarios_MaestroId",
                table: "AvisoDestinatarios",
                column: "MaestroId");

            migrationBuilder.CreateIndex(
                name: "IX_Avisos_UsuarioCreadorId",
                table: "Avisos",
                column: "UsuarioCreadorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AvisoDestinatarios");

            migrationBuilder.DropTable(
                name: "Avisos");
        }
    }
}
