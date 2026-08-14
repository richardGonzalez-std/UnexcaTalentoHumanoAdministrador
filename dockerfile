# Etapa 1: Compilación
# El build context es la raíz del repo, por eso todas las rutas de origen
# llevan el prefijo back/ (el proyecto Gradle no está en la raíz).
FROM eclipse-temurin:26-jdk-alpine AS build
WORKDIR /app

# El wrapper primero: cambia poco, así Docker cachea esta capa entre builds.
COPY back/gradlew ./
COPY back/gradle ./gradle
RUN chmod +x gradlew

COPY back/build.gradle back/settings.gradle ./
COPY back/src ./src

# Se usa ./gradlew (Gradle 9.4.1) y no el gradle del sistema, para que la
# versión coincida con la que exige Spring Boot 4.
RUN ./gradlew bootJar --no-daemon -x test

# Etapa 2: Imagen de ejecución
FROM eclipse-temurin:26-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
