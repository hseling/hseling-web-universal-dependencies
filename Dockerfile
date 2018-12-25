FROM node:8

WORKDIR /usr/src/app

COPY . .

EXPOSE 5316

CMD ["npm", "run", "dev-server"]