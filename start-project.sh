#!/bin/bash

echo "🚀 Iniciando ECO SUN..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 15

# Iniciar frontend
echo "🌐 Iniciando frontend..."
npm run dev

# Cleanup ao sair
trap "kill $BACKEND_PID 2>/dev/null" EXIT