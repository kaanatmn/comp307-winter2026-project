FROM eclipse-temurin:23-jdk

# set the working directory
WORKDIR /app

COPY . .

# permission to mvn wrapper
RUN chmod +x mvnw

# build Spring Boot application
RUN ./mvnw clean package -DskipTests

EXPOSE 8088

# run the app
CMD sh -c "java -jar target/*.jar"