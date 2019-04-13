sshpass -p aquaman scp -rpq schedules.json aquaman@192.168.178.116:/home/aquaman
curl -X PUT http://192.168.178.116:3000/scheduler/reload