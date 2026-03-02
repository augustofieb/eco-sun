#!/bin/bash

echo "🚀 Iniciando ECO SUN..."
echo ""

# Verificar se Maven está instalado
if ! command -v mvn &> /dev/null; then
    echo "📦 Maven não encontrado. Instalando..."
    sudo apt update && sudo apt install -y maven
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Parar processos anteriores
echo "🧹 Limpando processos anteriores..."
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Iniciar backend em background
echo "🔧 Iniciando backend (porta 8081)..."
cd backend
nohup mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Aguardando backend inicializar (pode levar até 60 segundos)..."
for i in {1..60}; do
    if curl -s http://localhost:8081/api/test/ping > /dev/null 2>&1; then
        echo ""
        echo "✅ Backend iniciado com sucesso!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo ""
        echo "⚠️  Backend não respondeu em 60 segundos."
        echo "📋 Últimas 20 linhas do log:"
        tail -20 backend.log
        echo ""
        echo "💡 Opções:"
        echo "   1. Pressione 's' para continuar mesmo assim (backend pode ainda estar iniciando)"
        echo "   2. Pressione 'n' para cancelar e verificar o problema"
        echo "   3. Execute manualmente em outro terminal: cd backend && mvn spring-boot:run"
        echo ""
        read -p "Continuar? (s/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            kill $BACKEND_PID 2>/dev/null
            exit 1
        fi
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "🌐 Iniciando frontend (porta 5173)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Acesse: http://localhost:5173"
echo "🔑 Login de teste: admin@ecosun.com / admin123"
echo "📋 Logs do backend: tail -f backend.log"
echo "🛑 Para parar: Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

# Cleanup ao sair
trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID 2>/dev/null; pkill -f vite 2>/dev/null; echo '✅ Serviços parados'" EXIT