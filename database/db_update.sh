#!/bin/bash
set -e

for COUNTER in {1..120}
do
   sleep 1s
   echo "Check db is ready $COUNTER time(s)"
   pg_isready --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"
   if [ $? -eq 0 ]
   then
     break
   fi
done

echo "Try to execute update script(s) ..."
bash /opt/liquibase/liquibase --url="jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"  --username=$POSTGRES_USER --password=$POSTGRES_PASSWORD --classpath=changelog --changeLogFile=studio-lite.changelog-root.xml update

if [ $? -ne 0 ]
then
  echo "Update script error!"
else
  echo "Update script(s) successfully executed!"
fi
