#!/bin/bash

# Script para crear repositorio en GitHub
# Requiere: GitHub CLI (gh) instalado

REPO_NAME="lucho-web-cms"
DESCRIPTION="CMS para landing page de arquitectura con Firebase y Netlify"

echo "🚀 Creando repositorio en GitHub..."
echo ""

# Verificar que gh esté instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado"
    echo "   Instala con: brew install gh"
    echo "   O desde: https://cli.github.com/"
    exit 1
fi

# Verificar login
echo "🔐 Verificando login en GitHub..."
if ! gh auth status &> /dev/null; then
    echo "⚠️  No estás logueado. Ejecutando login..."
    gh auth login
fi

echo ""
echo "📦 Creando repositorio: $REPO_NAME"
echo ""

# Crear repositorio
gh repo create "$REPO_NAME" \
    --description "$DESCRIPTION" \
    --public \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repositorio creado exitosamente!"
    echo ""
    echo "📋 Información:"
    echo "   Repositorio: https://github.com/colbapnauj/$REPO_NAME"
    echo "   Remoto: origin"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Agregar secrets en GitHub para Netlify:"
    echo "      - NETLIFY_SITE_ID"
    echo "      - NETLIFY_AUTH_TOKEN"
    echo "      - FIREBASE_SERVICE_ACCOUNT"
    echo "   2. El workflow de GitHub Actions se ejecutará automáticamente"
    echo ""
else
    echo "❌ Error al crear el repositorio"
    exit 1
fi
