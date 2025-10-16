#!/bin/bash

echo "🚀 Iniciando ECO SUN..."

# Verificar se Maven está instalado
if ! command -v mvn &> /dev/null; then
    echo "📦 Maven não encontrado. Instalando..."
    sudo apt update && sudo apt install -y maven
fi

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
for i in {1..30}; do
    if curl -s http://localhost:8081/api/test/ping > /dev/null 2>&1; then
        echo "✅ Backend iniciado com sucesso!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend não iniciou em 30 segundos. Verificando logs..."
        echo "📋 Últimas linhas do log do backend:"
        tail -10 backend.log
        echo "💡 Tente executar manualmente: cd backend && mvn spring-boot:run"
        exit 1
    fi
    sleep 1
done

# Iniciar frontend
echo "🌐 Iniciando frontend..."
npm run dev

# Cleanup ao sair
trap "kill $BACKEND_PID 2>/dev/null" EXIT