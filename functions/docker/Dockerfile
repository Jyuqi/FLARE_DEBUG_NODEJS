FROM flareforecast/flare-download-noaa-dev AS FLARE-containers

FROM node:8-slim

WORKDIR /code

COPY . /code
RUN npm install && \
    npm install shelljs 

RUN mv /code/node_modules /node_modules

COPY --from=FLARE-containers / /

EXPOSE 8080

CMD ["npm", "start"]