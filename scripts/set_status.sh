timestamp=$(date +%s)
message="{\"deviceId\":\"$1\",\"command\":\"set_status\",\"timestamp\":\"$timestamp\",\"payload\":{\"slotId\":\"$2\",\"state\":\"$3\"}}"
echo "sendin JSON: $message"
mosquitto_pub -m "$message" -t "control"
