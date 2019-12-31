#!/usr/bin/env bash
docker run \
-it \
-m 512m \
--rm \
-v /Users/youxingzhi/ayou/net-advance/http-advance/range/demo/server/files:/data \
-p 3001:3001 \
--name chunk-demo2 \
--oom-kill-disable \
chunk-demo2
