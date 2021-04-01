FROM node:8-slim

WORKDIR /code

COPY . /code

RUN apt-get -yq update && \
	apt-get -yqq install wget \
	git \
	ssh 

RUN wget -O /usr/bin/yq https://github.com/mikefarah/yq/releases/download/3.4.1/yq_linux_amd64 && \
	chmod +x /usr/bin/yq

RUN npm install && \
    npm install shelljs

RUN mv /code/node_modules /node_modules

EXPOSE 8080

CMD ["npm", "start"]
