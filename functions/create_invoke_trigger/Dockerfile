FROM node:8-slim

WORKDIR /code

COPY . /code

Run apt-get update && apt-get install curl -y

RUN npm install

RUN mv /code/node_modules /node_modules

# COPY --from=FLARE-containers / /

EXPOSE 8080

CMD ["npm", "start"]
