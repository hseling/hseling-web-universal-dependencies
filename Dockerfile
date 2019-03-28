FROM node:8

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 80

CMD ["npm", "run", "dev-server"]
