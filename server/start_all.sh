#!/bin/bash
SHELL_FOLDER=$(cd "$(dirname "$0")";pwd)

num=10000
port=3000

arr=(
"game_hall"
"poker_niuniu"
"poker_niuniu"
)

echo $SHELL_FOLDER

for i in ${arr[@]};
do
  cmd="pm2 start "$SHELL_FOLDER"/"$i"/app.js  --name='"$num'_'$i"' -- '$port'"
  eval $cmd
  num=$[num+1]
  port=$[port+1]
done