FROM maven:3.9-eclipse-temurin-11 AS build
WORKDIR /app
COPY backend/ .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
