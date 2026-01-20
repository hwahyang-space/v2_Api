#!/bin/sh

redis-server --protected-mode no &

# Wait for Redis to start
sleep 2

npm start
