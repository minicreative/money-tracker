FROM node:12-alpine
WORKDIR /money-tracker
ADD . /money-tracker
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
