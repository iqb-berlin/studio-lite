# Studio Lite

This project explores frameworks: Nx for a web application in one repo, containing an Angular frontend and a NestJS backend. If successful, this project will replace the [IQB-Teststudio](https://github.com/iqb-berlin/teststudio-lite-setup#readme) written in Angular and php (several separated repos).

Please see this code as a draft. We check in all secrets, so this application should never go online. Feel free to check out and play around.

### Database
This project relies on a database locally running in a docker container. In order to set it up, please
* run the compose file `database/docker-compose-dev.yml`
* run `database/init_database.sql` script to create all tables
* run `database/insert_db_user.js` to create an admin user

### API
After starting the backend, you can use a swagger frontend to play with the endpoints. It listens to `localhost:3333/api`. Almost all endpoints require authentication:
* use the first endpoint to get an JSON Web Token (put in the credentials you've chosen above)
* copy this token, remove the quotes and push the button `Authorize`
* paste the token, close, and by now each endpoint call carries this token (bearer)
