FROM flareforecast/flare-download-observations:21.01.3 AS FLARE-containers

sudo apt-get install jq

WORKDIR /code

COPY . /code

EXPOSE 8080

CMD ["npm", "start"]