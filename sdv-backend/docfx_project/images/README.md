# Carpeta de imágenes

Coloca aquí las imágenes que uses en la documentación.

## Formatos recomendados

- **Logo:** SVG o PNG con fondo transparente
- **Diagramas:** SVG (escalable) o PNG de alta resolución
- **Capturas de pantalla:** PNG o JPG

## Uso en Markdown

```markdown
![Descripción de la imagen](../images/nombre-imagen.png)
```

## Ejemplo de logo

Si tienes un logo, nómbralo `logo.svg` o `logo.png` y colócalo aquí.
Luego actualiza `docfx.json`:

```json
"globalMetadata": {
  "_appLogoPath": "images/logo.svg"
}
```
