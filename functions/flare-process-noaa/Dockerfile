FROM flareforecast/flare-process-noaa AS FLARE-containers

FROM node:8-slim

WORKDIR /code

COPY . /code

RUN npm install && \
    npm install shelljs && \
    npm install js-yaml --save

RUN mv /code/node_modules /node_modules

COPY --from=FLARE-containers / /

EXPOSE 8080

CMD ["npm", "start"]