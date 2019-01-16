FROM node:8

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 5316

CMD ["npm", "run", "dev-server"]
