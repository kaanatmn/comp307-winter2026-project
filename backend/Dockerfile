# Use official Java 17 image
FROM eclipse-temurin:23-jdk

# Set the working directory
WORKDIR /app

# Copy all your backend code into the virtual computer
COPY . .

# Make sure the maven wrapper has permission to run
RUN chmod +x mvnw

# Build the Spring Boot application
RUN ./mvnw clean package -DskipTests

# Expose port 8088 so the internet can reach it
EXPOSE 8088

# Command to run the application
CMD sh -c "java -jar target/*.jar"