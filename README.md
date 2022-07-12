# Studio Lite

This project explores frameworks: Nx for a web application in one repo, containing an Angular frontend and a NestJS backend. If successful, this project will replace the [IQB-Teststudio](https://github.com/iqb-berlin/teststudio-lite-setup#readme) written in Angular and php (several separated repos).

Please see this code as a draft. We check in all secrets, so this application should never go online. Feel free to check out and play around.

### Database
This project relies on a database locally running in a docker container. To start the db use the command 'make dev-db-up'. The first start initializes the db with base data automatically. To stop the db, please use the command 'make dev-db-down'.

### API
After starting the backend, you can use a swagger frontend to play with the endpoints. It listens to `localhost:3333/api`. Almost all endpoints require authentication:
* use the first endpoint to get an JSON Web Token (put in the credentials you've chosen above)
* copy this token, remove the quotes and push the button `Authorize`
* paste the token, close, and by now each endpoint call carries this token (bearer)

### Deployment
To install a version of this software on a separate server that possibly could be used in production later, you have to copy four files to a separate directory on this server:
1. 'docker-compose.yml' (from project root)
2. 'docker-compose.prod.yml' (from project root)
3. '.env.prod' (from project root)
4. 'prod.mk' (from 'scripts/make/prod.mk')

On your server, adjust some environment variables in the '.env.prod' file for security issues, rename 'prod.mk' to 'Makefile', and install 'make' if necessary.
To start the docker services use the command 'make production-ramp-up'. To stop and remove the service containers use the command 'production-shut-down'.
