# DocFX - Documentacion SDV Backend

Esta carpeta contiene la configuracion y archivos fuente para generar la documentacion del proyecto usando **DocFX**.

## Inicio rapido

### Generar documentacion

Desde la raiz del proyecto, ejecuta:

```powershell
.\generate-docs.ps1
```

Este script:
1. Verifica que DocFX este instalado
2. Compila el proyecto backend
3. Extrae metadatos del codigo
4. Genera el sitio estatico
5. (Opcional) Inicia servidor local en `http://localhost:9090`

### Comandos manuales

```powershell
cd docfx_project

# Extraer metadatos
docfx metadata docfx.json

# Generar sitio
docfx build docfx.json

# Ver localmente (puerto 9090)
docfx serve _site --port 9090
```

## Estructura

```
docfx_project/
+-- api/                  # Generado automaticamente (no editar)
+-- articles/             # Guias y tutoriales (editable)
|   +-- intro.md
|   +-- getting-started.md
|   +-- architecture.md
|   +-- mensualidades.md
+-- images/               # Imagenes para la documentacion
+-- _site/                # Sitio generado (no editar)
+-- docfx.json            # Configuracion principal
+-- index.md              # Pagina de inicio
+-- toc.yml               # Tabla de contenidos principal
```

## Agregar nuevo articulo

1. Crea un archivo `.md` en `articles/`
2. Agregalo a `articles/toc.yml`
3. Regenera la documentacion

**Ejemplo:**

```yaml
# articles/toc.yml
- name: Mi nuevo articulo
  href: mi-articulo.md
```

## Personalizacion

### Cambiar titulo

Edita `docfx.json`:

```json
"globalMetadata": {
  "_appTitle": "Tu Titulo Aqui"
}
```

### Agregar logo

1. Coloca tu logo en `images/logo.svg`
2. Edita `docfx.json`:

```json
"globalMetadata": {
  "_appLogoPath": "images/logo.svg"
}
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 8080 |
| Backend API | 5000/5001 |
| DocFX | 9090 |

## Solucion de problemas

### Error: "DocFX no esta instalado"

```powershell
dotnet tool install -g docfx
```

### Error: "No se pudo extraer metadatos"

Verifica que el proyecto compile correctamente:

```powershell
cd ../sdv-backend
dotnet build
```

### Los cambios no se reflejan

Limpia y regenera:

```powershell
cd docfx_project
Remove-Item -Recurse -Force _site, api, obj
docfx metadata
docfx build
```

### Puerto 9090 ocupado

Usa otro puerto:

```powershell
docfx serve _site --port 9091
```

## Recursos

- [Documentacion oficial de DocFX](https://dotnet.github.io/docfx/)
- [Guia de Markdown](https://www.markdownguide.org/)
- [XML Documentation Comments](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/)
