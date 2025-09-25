#!/bin/bash

echo "🚀 Iniciando ECO SUN..."

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd backend
nohup mvn spring-boot:run > backend.log 2>&1 &
cd ..

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 15

# Testar backend
if curl -s http://localhost:8081/api/test/ping > /dev/null; then
    echo "✅ Backend funcionando!"
else
    echo "❌ Erro no backend"
    exit 1
fi

# Iniciar frontend
echo "🎨 Iniciando frontend..."
nohup npm run dev > frontend.log 2>&1 &

echo "✅ Projeto iniciado com sucesso!"
echo "🌐 Frontend: https://$CODESPACE_NAME-5173.app.github.dev"
echo "🔧 Backend: http://localhost:8081/api"
echo "👤 Login: admin@ecosun.com / admin123"