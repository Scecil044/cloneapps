#Stage 1: Build application
FROM node:14.15.4 AS build
#Set the working directory in the container
WORKDIR /app
COPY . .
#Stage 2:Run stage
FROM node:14-bullseye-slim
#Copy only the necessary files from the build stage
COPY --from=build /app ./
#install pm2
RUN npm install pm2 -g
#Command to run the application
CMD ["pm2-runtime", "start", "ecosystem.config.json", "--env", "preprod"]