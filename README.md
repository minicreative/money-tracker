# money-tracker

Money Tracker is an open source tool for recording and displaying your expenses and income. This tool is motivated by the belief that ethics under capitalism are only remotely possible if individuals know where their money is going and how their habits dictate their position as economic agents.  

### Setup

Do `npm install`  

Set the following environment variables:
```
mt_port: port which Express server listens on
mt_secret: secret used for authentication
mt_mongo_host: MongoDB host address
mt_mongo_name: MongoDB database name
mt_mongo_user: MongoDB username
mt_mongo_pass: MongoDB password
```

### Run
`npm run dev` to watch serve and watch UI and API in paralell  
`npm run start` to start application  
`npm run apidocs` to build the API documentation, accessible at /docs  
`npm run codedocs` to build the app documentation, accessible at /code  
`npm run app:dev` to watch the UI source code  
`npm run server:dev` to watch the API source code  
`npm run build` to build the UI  
`npm run build:full` to build the UI, API docs and code docs  