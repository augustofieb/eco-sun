#!/bin/bash
echo "🚀 Iniciando Backend ECO SUN na porta 8081..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
cd backend
mvn spring-boot:run