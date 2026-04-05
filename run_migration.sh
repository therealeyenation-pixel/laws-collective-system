#!/usr/bin/expect -f
set timeout 300
spawn npx drizzle-kit generate --name house_activation_system
while {1} {
    expect {
        "create table" { send "\r"; exp_continue }
        "rename table" { send "\r"; exp_continue }
        eof { break }
        timeout { break }
    }
}
