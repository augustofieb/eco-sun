#!/bin/bash
echo "🌞 Iniciando ECO SUN completo..."
echo "Backend: http://localhost:8081/api"
echo "Frontend: http://localhost:5173"
echo ""

# Configurar Java 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Iniciar backend em background
echo "🚀 Iniciando Backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 8

# Iniciar frontend
echo "🚀 Iniciando Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Projeto iniciado com sucesso!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8081/api"
echo ""
echo "Para parar os serviços, pressione Ctrl+C"

# Aguardar interrupção
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait