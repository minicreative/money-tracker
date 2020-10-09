FROM node:14-alpine
WORKDIR /money-tracker
ADD . /money-tracker
EXPOSE 3000
CMD ["npm", "run", "start"]
