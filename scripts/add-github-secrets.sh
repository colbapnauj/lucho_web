#!/bin/bash

# Script para agregar secrets a GitHub
# Requiere: GitHub CLI (gh) instalado y autenticado

REPO="colbapnauj/lucho-web-cms"

echo "🔐 Agregando Secrets a GitHub"
echo "Repositorio: $REPO"
echo ""

# Verificar que gh esté instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado"
    echo "   Instala con: brew install gh"
    echo "   Login con: gh auth login"
    exit 1
fi

# Verificar login
if ! gh auth status &> /dev/null; then
    echo "⚠️  No estás logueado en GitHub CLI"
    echo "   Ejecuta: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configurado"
echo ""

# 1. NETLIFY_SITE_ID
echo "📋 NETLIFY_SITE_ID"
if command -v netlify &> /dev/null; then
    echo "   Obteniendo desde Netlify..."
    SITE_ID=$(netlify status 2>/dev/null | grep -i "site id" | awk '{print $NF}' | head -1)
    if [ -z "$SITE_ID" ]; then
        echo "   ⚠️  No se pudo obtener automáticamente"
        echo "   Por favor, ingresa el NETLIFY_SITE_ID manualmente:"
        read -p "   Site ID: " SITE_ID
    fi
else
    echo "   ⚠️  Netlify CLI no está instalado"
    echo "   Obtén el Site ID desde: Netlify Dashboard → Site settings → General"
    read -p "   Ingresa el NETLIFY_SITE_ID: " SITE_ID
fi

if [ -n "$SITE_ID" ]; then
    echo "   Agregando NETLIFY_SITE_ID..."
    echo "$SITE_ID" | gh secret set NETLIFY_SITE_ID --repo "$REPO"
    if [ $? -eq 0 ]; then
        echo "   ✅ NETLIFY_SITE_ID agregado"
    else
        echo "   ❌ Error al agregar NETLIFY_SITE_ID"
    fi
fi

echo ""

# 2. NETLIFY_AUTH_TOKEN
echo "📋 NETLIFY_AUTH_TOKEN"
if command -v netlify &> /dev/null; then
    echo "   Obteniendo desde Netlify CLI..."
    AUTH_TOKEN=$(netlify auth:token 2>/dev/null)
    if [ -z "$AUTH_TOKEN" ]; then
        echo "   ⚠️  No se pudo obtener automáticamente"
        echo "   Obtén desde: https://app.netlify.com/user/applications"
        read -p "   Ingresa el NETLIFY_AUTH_TOKEN: " AUTH_TOKEN
    fi
else
    echo "   ⚠️  Netlify CLI no está instalado"
    echo "   Obtén desde: https://app.netlify.com/user/applications"
    read -p "   Ingresa el NETLIFY_AUTH_TOKEN: " AUTH_TOKEN
fi

if [ -n "$AUTH_TOKEN" ]; then
    echo "   Agregando NETLIFY_AUTH_TOKEN..."
    echo "$AUTH_TOKEN" | gh secret set NETLIFY_AUTH_TOKEN --repo "$REPO"
    if [ $? -eq 0 ]; then
        echo "   ✅ NETLIFY_AUTH_TOKEN agregado"
    else
        echo "   ❌ Error al agregar NETLIFY_AUTH_TOKEN"
    fi
fi

echo ""

# 3. FIREBASE_SERVICE_ACCOUNT
echo "📋 FIREBASE_SERVICE_ACCOUNT"
SERVICE_ACCOUNT_FILE="service-account-key.json"

if [ -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "   Archivo encontrado: $SERVICE_ACCOUNT_FILE"
    echo "   Agregando FIREBASE_SERVICE_ACCOUNT..."
    gh secret set FIREBASE_SERVICE_ACCOUNT --repo "$REPO" < "$SERVICE_ACCOUNT_FILE"
    if [ $? -eq 0 ]; then
        echo "   ✅ FIREBASE_SERVICE_ACCOUNT agregado"
    else
        echo "   ❌ Error al agregar FIREBASE_SERVICE_ACCOUNT"
    fi
else
    echo "   ⚠️  Archivo $SERVICE_ACCOUNT_FILE no encontrado"
    echo "   Asegúrate de tener el archivo en la raíz del proyecto"
fi

echo ""
echo "📋 Verificando secrets agregados..."
echo ""
gh secret list --repo "$REPO"

echo ""
echo "✅ Proceso completado!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verifica que los 3 secrets estén listados arriba"
echo "   2. Haz un push a main/master para trigger el workflow"
echo "   3. Revisa GitHub Actions para ver el deploy"
echo ""
