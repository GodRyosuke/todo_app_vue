#! /bin/bash

USER_ID=${USER_ID:-1001}
GROUP_ID=${GROUP_ID:-1001}

if ! id "$USER_ID" &> /dev/null; then
  useradd -u $USER_ID -o -m user
  groupmod -g $GROUP_ID user
  export HOME=/home/user
fi

exec gosu $(id -un $USER_ID) "$@"
