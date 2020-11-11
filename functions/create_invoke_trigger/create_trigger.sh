AUTH=$1    #first argument
APIHOST=$2  

# create a trigger period first, feed is stored in the trigger
curl -u $AUTH https://$APIHOST/api/v1/namespaces/_/triggers/periodic?overwrite=true \
-X PUT -H "Content-Type: application/json" \
-d '{"name":"periodic","annotations":[{"key":"feed","value":"/whisk.system/alarms/alarm"}]}'

# invoke the feed action with the parameters to configure the feed provider to fire the trigger every 30 seconds
curl -u $AUTH "https://$APIHOST/api/v1/namespaces/whisk.system/actions/alarms/alarm?blocking=true&result=false" \
-X POST -H "Content-Type: application/json" \
-d "{\"authKey\":\"$AUTH\",\"cron\":\"*/8 * * * * *\",\"lifecycleEvent\":\"CREATE\",\"triggerName\":\"/_/periodic\",\"trigger_payload\":{\"name\":\"Mork\", \"place\":\"Ork\"}}"

#  create an rule to bind a trigger and an action
curl -u $AUTH https://$APIHOST/api/v1/namespaces/_/rules/myRule2?overwrite=true \
-X PUT -H "Content-Type: application/json" \
-d '{"name":"myRule2","status":"","trigger":"/_/periodic","action":"/whisk.system/samples/greeting"}'