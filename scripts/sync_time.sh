timestamp=$(date +%s)
message="{\"deviceId\":\"$1\",\"command\":\"sync_time\",\"timestamp\":\"$timestamp\",\"payload\":{}}"
echo "sendin JSON: $message"
mosquitto_pub -m "$message" -t "control"
