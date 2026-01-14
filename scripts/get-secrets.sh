#!/bin/bash

# Script para obtener los valores de los secrets necesarios
# Esto te ayuda a copiar los valores para agregarlos en GitHub

echo "🔐 Obteniendo valores para GitHub Secrets"
echo ""

# Verificar Netlify CLI
if command -v netlify &> /dev/null; then
    echo "📋 NETLIFY_SITE_ID:"
    echo "   Ejecuta: netlify status"
    echo "   O desde Netlify Dashboard: Site settings → General → Site details"
    echo ""
    
    echo "📋 NETLIFY_AUTH_TOKEN:"
    echo "   Ejecuta: netlify auth:token"
    echo "   O desde: https://app.netlify.com/user/applications"
    echo ""
else
    echo "⚠️  Netlify CLI no está instalado"
    echo "   Obtén los valores desde Netlify Dashboard:"
    echo "   - Site ID: Site settings → General → Site details"
    echo "   - Auth Token: https://app.netlify.com/user/applications"
    echo ""
fi

# Verificar service account
if [ -f "service-account-key.json" ]; then
    echo "📋 FIREBASE_SERVICE_ACCOUNT:"
    echo "   Archivo encontrado: service-account-key.json"
    echo ""
    echo "   Para copiar el contenido:"
    echo "   cat service-account-key.json | pbcopy"
    echo "   (esto copia el JSON al portapapeles)"
    echo ""
else
    echo "⚠️  service-account-key.json no encontrado"
    echo "   Asegúrate de tener el archivo en la raíz del proyecto"
    echo ""
fi

echo "📝 Próximos pasos:"
echo "   1. Copia cada valor"
echo "   2. Ve a GitHub: https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions"
echo "   3. Agrega cada secret:"
echo "      - NETLIFY_SITE_ID"
echo "      - NETLIFY_AUTH_TOKEN"
echo "      - FIREBASE_SERVICE_ACCOUNT"
echo ""
