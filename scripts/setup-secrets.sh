#!/bin/bash

# Script para configurar todos los secrets necesarios
# Para GitHub Actions y Netlify

echo "🔐 Configuración de Secrets"
echo "============================"
echo ""

# Verificar herramientas
HAS_GH=false
HAS_NETLIFY=false

if command -v gh &> /dev/null; then
    HAS_GH=true
    echo "✅ GitHub CLI encontrado"
else
    echo "⚠️  GitHub CLI no encontrado (opcional)"
fi

if command -v netlify &> /dev/null; then
    HAS_NETLIFY=true
    echo "✅ Netlify CLI encontrado"
else
    echo "⚠️  Netlify CLI no encontrado"
fi

echo ""

# 1. Obtener NETLIFY_SITE_ID
echo "📋 NETLIFY_SITE_ID"
echo "------------------"
if [ "$HAS_NETLIFY" = true ]; then
    SITE_ID=$(netlify status 2>/dev/null | grep -i "site id" | awk '{print $NF}' | head -1)
    if [ -n "$SITE_ID" ]; then
        echo "✅ Site ID encontrado: $SITE_ID"
        NETLIFY_SITE_ID="$SITE_ID"
    else
        echo "⚠️  No se pudo obtener automáticamente"
        echo "   Obtén desde: Netlify Dashboard → Site settings → General → Site details"
        read -p "   Ingresa NETLIFY_SITE_ID: " NETLIFY_SITE_ID
    fi
else
    echo "   Obtén desde: Netlify Dashboard → Site settings → General → Site details"
    read -p "   Ingresa NETLIFY_SITE_ID: " NETLIFY_SITE_ID
fi
echo ""

# 2. Obtener NETLIFY_AUTH_TOKEN
echo "📋 NETLIFY_AUTH_TOKEN"
echo "----------------------"
if [ "$HAS_NETLIFY" = true ]; then
    AUTH_TOKEN=$(netlify auth:token 2>/dev/null)
    if [ -n "$AUTH_TOKEN" ]; then
        echo "✅ Token obtenido (oculto por seguridad)"
        NETLIFY_AUTH_TOKEN="$AUTH_TOKEN"
    else
        echo "⚠️  No se pudo obtener automáticamente"
        echo "   Obtén desde: https://app.netlify.com/user/applications"
        read -p "   Ingresa NETLIFY_AUTH_TOKEN: " NETLIFY_AUTH_TOKEN
    fi
else
    echo "   Obtén desde: https://app.netlify.com/user/applications"
    read -p "   Ingresa NETLIFY_AUTH_TOKEN: " NETLIFY_AUTH_TOKEN
fi
echo ""

# 3. Verificar FIREBASE_SERVICE_ACCOUNT
echo "📋 FIREBASE_SERVICE_ACCOUNT"
echo "----------------------------"
SERVICE_ACCOUNT_FILE="service-account-key.json"
if [ -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "✅ Archivo encontrado: $SERVICE_ACCOUNT_FILE"
    FIREBASE_SERVICE_ACCOUNT=$(cat "$SERVICE_ACCOUNT_FILE")
else
    echo "❌ Archivo no encontrado: $SERVICE_ACCOUNT_FILE"
    exit 1
fi
echo ""

# Resumen
echo "📊 Resumen de valores obtenidos:"
echo "   ✅ NETLIFY_SITE_ID: ${NETLIFY_SITE_ID:0:20}..."
echo "   ✅ NETLIFY_AUTH_TOKEN: ${NETLIFY_AUTH_TOKEN:0:20}..."
echo "   ✅ FIREBASE_SERVICE_ACCOUNT: Archivo encontrado"
echo ""

# Configurar GitHub Secrets
if [ "$HAS_GH" = true ]; then
    echo "🔧 Configurando GitHub Secrets..."
    echo ""
    
    # Verificar login
    if ! gh auth status &> /dev/null; then
        echo "⚠️  No estás logueado en GitHub CLI"
        echo "   Ejecuta: gh auth login"
        echo ""
        read -p "¿Quieres hacer login ahora? (y/n): " DO_LOGIN
        if [ "$DO_LOGIN" = "y" ]; then
            gh auth login
        else
            echo "   Saltando configuración de GitHub Secrets"
            HAS_GH=false
        fi
    fi
    
    if [ "$HAS_GH" = true ]; then
        REPO="colbapnauj/lucho-web-cms"
        
        echo "   Agregando NETLIFY_SITE_ID..."
        echo "$NETLIFY_SITE_ID" | gh secret set NETLIFY_SITE_ID --repo "$REPO" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ NETLIFY_SITE_ID agregado"
        else
            echo "   ❌ Error al agregar NETLIFY_SITE_ID"
        fi
        
        echo "   Agregando NETLIFY_AUTH_TOKEN..."
        echo "$NETLIFY_AUTH_TOKEN" | gh secret set NETLIFY_AUTH_TOKEN --repo "$REPO" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ NETLIFY_AUTH_TOKEN agregado"
        else
            echo "   ❌ Error al agregar NETLIFY_AUTH_TOKEN"
        fi
        
        echo "   Agregando FIREBASE_SERVICE_ACCOUNT..."
        echo "$FIREBASE_SERVICE_ACCOUNT" | gh secret set FIREBASE_SERVICE_ACCOUNT --repo "$REPO" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ FIREBASE_SERVICE_ACCOUNT agregado"
        else
            echo "   ❌ Error al agregar FIREBASE_SERVICE_ACCOUNT"
        fi
        
        echo ""
        echo "📋 Verificando secrets en GitHub..."
        gh secret list --repo "$REPO"
    fi
else
    echo "⚠️  GitHub CLI no disponible"
    echo "   Agrega los secrets manualmente en:"
    echo "   https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions"
    echo ""
    echo "   Secrets a agregar:"
    echo "   - NETLIFY_SITE_ID: $NETLIFY_SITE_ID"
    echo "   - NETLIFY_AUTH_TOKEN: $NETLIFY_AUTH_TOKEN"
    echo "   - FIREBASE_SERVICE_ACCOUNT: (contenido del JSON)"
fi

echo ""

# Configurar Netlify Environment Variables
if [ "$HAS_NETLIFY" = true ]; then
    echo "🔧 Configurando Netlify Environment Variables..."
    echo ""
    
    read -p "¿Quieres configurar FIREBASE_SERVICE_ACCOUNT en Netlify? (y/n): " CONFIG_NETLIFY
    if [ "$CONFIG_NETLIFY" = "y" ]; then
        echo "   Configurando FIREBASE_SERVICE_ACCOUNT en Netlify..."
        # Netlify CLI no tiene comando directo para set env vars, usar API o dashboard
        echo "   ⚠️  Netlify CLI no soporta set env vars directamente"
        echo "   Configura manualmente en:"
        echo "   https://app.netlify.com/sites/YOUR_SITE/settings/env"
        echo ""
        echo "   Variable: FIREBASE_SERVICE_ACCOUNT"
        echo "   Value: (contenido completo del service-account-key.json)"
        echo "   Scope: Builds"
    fi
else
    echo "⚠️  Netlify CLI no disponible"
    echo "   Configura manualmente en:"
    echo "   https://app.netlify.com/sites/YOUR_SITE/settings/env"
    echo ""
    echo "   Variable: FIREBASE_SERVICE_ACCOUNT"
    echo "   Value: (contenido completo del service-account-key.json)"
    echo "   Scope: Builds"
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verifica que los secrets estén en GitHub"
echo "   2. Configura FIREBASE_SERVICE_ACCOUNT en Netlify (opcional, si quieres builds en Netlify)"
echo "   3. Haz un push a main para trigger el workflow"
echo ""
