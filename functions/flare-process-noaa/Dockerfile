FROM flareforecast/flare-process-noaa:21.01.3 AS FLARE-containers

# Start OpenWhisk Service
WORKDIR /openwhisk
EXPOSE 8080
USER user:user
CMD ["npm", "start"]