#!/bin/bash

# Script para configurar Netlify
# Ejecuta: bash setup-netlify.sh

echo "🚀 Configurando Netlify para lucho-web-cms"
echo ""

# Verificar que netlify CLI esté instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI no está instalado"
    echo "   Instala con: npm install -g netlify-cli"
    exit 1
fi

echo "✅ Netlify CLI encontrado"
echo ""

# Verificar login
echo "🔐 Verificando login en Netlify..."
if ! netlify status &> /dev/null; then
    echo "⚠️  No estás logueado. Ejecutando login..."
    netlify login
fi

echo ""
echo "📦 Creando proyecto en Netlify..."
echo "   Esto te pedirá:"
echo "   - Nombre del sitio: lucho-web-cms"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo ""

# Inicializar proyecto
netlify init

echo ""
echo "✅ Proyecto configurado!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Obtén el Site ID: netlify status"
echo "   2. Obtén el Auth Token: netlify auth:token"
echo "   3. Agrega estos como secrets en GitHub:"
echo "      - NETLIFY_SITE_ID"
echo "      - NETLIFY_AUTH_TOKEN"
echo ""
