# Deployment Guide - Monitor Dólar Venezuela

## Opción 1: Vercel (Recomendado - Más Fácil)

1. Ve a [vercel.com](https://vercel.com)
2. Haz login con tu cuenta de GitHub
3. Click en "Add New Project"
4. Importa el repositorio `monitor-dolar-venezuela`
5. Click en "Deploy" (no necesitas cambiar nada)
6. ¡Listo! Tu app estará en una URL tipo: `monitor-dolar-venezuela.vercel.app`

**Ventajas**:
- Deploy automático cada vez que hagas push a GitHub
- Gratis para uso personal
- Soporte completo de Next.js

---

## Opción 2: GitHub Pages

### Paso 1: Build estático
```bash
npm run build
```

### Paso 2: Configurar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "GitHub Actions"
4. Crea el archivo `.github/workflows/deploy.yml` con el siguiente contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Paso 3: Push y Deploy
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

Tu app estará disponible en: `https://willians45.github.io/monitor-dolar-venezuela`

---

## Notas
- GitHub Pages puede tardar unos minutos en la primera vez
- Vercel es instantáneo y actualiza automáticamente
- Ambos son gratis para uso personal
