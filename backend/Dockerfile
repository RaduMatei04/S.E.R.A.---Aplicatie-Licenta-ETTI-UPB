# Stagiul 1 - build. Dependentele se rezolva intr-un strat separat, ca o
# modificare de cod sa nu invalideze cache-ul descarcarilor Maven.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# Stagiul 2 - runtime. Doar JRE, fara Maven si fara surse.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Proces neprivilegiat: containerul nu are nevoie de root ca sa ruleze un jar.
RUN addgroup -S sera && adduser -S sera -G sera
USER sera

COPY --from=build /build/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
