FROM node:8-slim

WORKDIR /code

COPY . /code

RUN apt-get -yq update && \
	apt-get -yqq install wget \
	git \
	ssh 

RUN npm install && \
    npm install shelljs

RUN mv /code/node_modules /node_modules

EXPOSE 8080

CMD ["npm", "start"]
