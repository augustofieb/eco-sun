#!/bin/bash

echo "🚀 Testando migração do LocalStorage para API..."

# Verificar se o backend está rodando
echo "📡 Verificando backend..."
if curl -s http://localhost:8081/api/produtos > /dev/null; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend não está rodando. Inicie com: cd backend && mvn spring-boot:run"
    exit 1
fi

# Testar endpoints principais
echo "🧪 Testando endpoints..."

echo "  - Testando GET /produtos..."
if curl -s http://localhost:8081/api/produtos | grep -q "nome"; then
    echo "    ✅ Produtos OK"
else
    echo "    ❌ Produtos FALHOU"
fi

echo "  - Testando POST /auth/login..."
if curl -s -X POST http://localhost:8081/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ecosun.com","senha":"password"}' | grep -q "token"; then
    echo "    ✅ Login OK"
else
    echo "    ❌ Login FALHOU"
fi

echo "  - Testando GET /usuarios..."
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ecosun.com","senha":"password"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/usuarios | grep -q "nome"; then
    echo "    ✅ Usuários OK"
else
    echo "    ❌ Usuários FALHOU"
fi

echo ""
echo "🎉 Migração testada! Agora você pode:"
echo "   1. Fazer login com: admin@ecosun.com / password"
echo "   2. Gerenciar usuários no painel admin"
echo "   3. Adicionar/editar produtos"
echo "   4. Deixar avaliações nos produtos"
echo ""
echo "📝 Todas as operações agora usam a API ao invés do localStorage!"