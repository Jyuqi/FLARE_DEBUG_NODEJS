FROM flareforecast/flare-process-observations:21.01.3 AS FLARE-containers

RUN apt-get install jq -y

WORKDIR /code

COPY . /code

EXPOSE 8080

CMD ["npm", "start"]