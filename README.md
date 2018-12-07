# backend_gitlink


### variables needed in .env :
PORT: port number

SESSION_SECRET: random string to protect the session

CLIENT_ID: Github Oauth Client Id

CLIENT_SECRET: Github Oauth Client Secret

MONGO_URI: Uri to connect to mongodb
example: mongodb://localhost/gitlink

### Generate documentation:
```apidoc -i routes/ -o apidoc/```
