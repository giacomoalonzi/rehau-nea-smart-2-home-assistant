#!/usr/bin/with-contenv bashio

# Read config from Home Assistant
export REHAU_EMAIL=$(bashio::config 'rehau_email')
export REHAU_PASSWORD=$(bashio::config 'rehau_password')
export MQTT_HOST=$(bashio::config 'mqtt_host')
export MQTT_PORT=$(bashio::config 'mqtt_port')
export API_PORT=$(bashio::config 'api_port')
export LOG_LEVEL=$(bashio::config 'log_level')

# Only set MQTT credentials if they are provided
if bashio::config.has_value 'mqtt_user'; then
  export MQTT_USER=$(bashio::config 'mqtt_user')
fi
if bashio::config.has_value 'mqtt_password'; then
  export MQTT_PASSWORD=$(bashio::config 'mqtt_password')
fi

# Read interval configurations (with defaults)
export ZONE_RELOAD_INTERVAL=$(bashio::config 'zone_reload_interval' '300')
export TOKEN_REFRESH_INTERVAL=$(bashio::config 'token_refresh_interval' '21600')
export REFERENTIALS_RELOAD_INTERVAL=$(bashio::config 'referentials_reload_interval' '86400')

# Read USE_GROUP_IN_NAMES configuration (with default)
export USE_GROUP_IN_NAMES=$(bashio::config 'use_group_in_names' 'false')

bashio::log.info "Starting REHAU NEA SMART 2.0 MQTT Bridge (TypeScript)..."
bashio::log.info "MQTT Host: ${MQTT_HOST}:${MQTT_PORT}"
bashio::log.info "API Port: ${API_PORT}"
bashio::log.info "Zone Reload Interval: ${ZONE_RELOAD_INTERVAL}s"
bashio::log.info "Token Refresh Interval: ${TOKEN_REFRESH_INTERVAL}s"
bashio::log.info "Referentials Reload Interval: ${REFERENTIALS_RELOAD_INTERVAL}s"
bashio::log.info "Use Group in Names: ${USE_GROUP_IN_NAMES}"

# Start the compiled JavaScript application
cd /app
exec node dist/index.js
