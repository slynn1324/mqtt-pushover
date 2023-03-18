#!/bin/bash

podman run -d --restart=unless-stopped --name mqtt-pushover --network=host mqtt-pushover
