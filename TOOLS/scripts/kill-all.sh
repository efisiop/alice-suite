#!/bin/bash

kill $(lsof -t -i:3001)
kill $(lsof -t -i:5173)
kill $(lsof -t -i:8080)