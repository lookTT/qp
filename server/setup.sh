#!/bin/bash

# 关闭防火墙
# systemctl stop firewalld
# systemctl disable firewalld
yum update -y
yum install gcc-c++ make zip unzip wget -y
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
yum -y install nodejs

yum install -y mariadb mariadb-server mariadb-devel
systemctl restart mariadb
systemctl enable mariadb
# mysqladmin -u root password ''
# mysql -u root -p
# use mysql;
# select host, user, password from user;
# update user set host="%" where host='localhost' and user='root';
systemctl restart mariadb

sudo yum install epel-release -y
sudo yum install nginx php php-fpm php-mysql php-gd php-imap php-ldap php-odbc php-pear php-xml php-xmlrpc -y
systemctl enable nginx
systemctl enable php-fpm
vi /etc/php-fpm.d/www.conf
# 修改
# listen = 127.0.0.1:9000 
# 为
# listen = 127.0.0.1:8000
# 修改
# user = apache
# group = apache
# 为
# user = nginx
# group = nginx
systemctl restart php-fpm 

vi /etc/nginx/nginx.conf
# http {
#     include       /etc/nginx/mime.types;
#     default_type  application/octet-stream;

#     log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
#                       '$status $body_bytes_sent "$http_referer" '
#                       '"$http_user_agent" "$http_x_forwarded_for"';

#     access_log  /var/log/nginx/access.log  main;

#     sendfile        on;
#     #tcp_nopush     on;

#     keepalive_timeout  65;

#     #gzip  on;

#     include /etc/nginx/conf.d/*.conf;

#     #增加该行为可进行跨域访问
#     add_header Access-Control-Allow-Origin *;
# }


vim /etc/nginx/conf.d/default.conf
# server {
#     listen       80 default_server;
#     #listen       [::]:80 default_server;
#     server_name  _;
#     root         /usr/share/nginx/html;

#     # Load configuration files for the default server block.
#     include /etc/nginx/default.d/*.conf;

#     location / {
#         index  index.php  index.html;
#     }

#     error_page 404 /404.html;
#         location = /40x.html {
#     }

#     error_page 500 502 503 504 /50x.html;
#         location = /50x.html {
#     }

#     #让Nginx对PHP可以进行解析
#     location ~ \.php$ {
#         root           html;
#         fastcgi_pass   127.0.0.1:8000;
#         fastcgi_index  index.php;
#         fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
#         include        fastcgi_params;
#     }

#     #如果需要让浏览器进行缓存则设置该信息
#     location ~ .*\.(jpg|png|css|js|mp3)(.*) {
#         access_log off;
#         expires 30d;
#     }
# }

systemctl restart nginx


# 可以在目录下增加php文件并访问测试一下是否支持了PHP
echo "<?php phpinfo() ?>" >> /usr/share/nginx/html/1.php
# 确认支持了就可以删掉他了 一定记得删掉
rm -rf /usr/share/nginx/html/1.php

# 设置每天凌晨5点重启服务器
crontab -e
# 添加如下命令
# 0 5 * * * /usr/bin/pm2 restart all
0 5 * * * sh /home/mysqlback/backup.sh
0 5 * * * sh /home/serverlog/backup.sh
# 重启定时任务
service crond restart

# 创建头像对应的文件夹
mkdir /usr/share/nginx/html/headimg


# 如果需要redis服务器
# wget http://download.redis.io/releases/redis-4.0.11.tar.gz
# tar zxvf redis-4.0.1.tar.gz
# cd redis-4.0.1
# make
# make install
# cp ./redis.conf /etc/redis.conf
# vi /etc/redis.conf
    # bind 127.0.0.1
    # 改为
    # bind 0.0.0.0
    # 
    # port 6379
    # 改为
    # port 6363
    #
    # daemonize no
    # 改为
    # daemonize yes
    #
    # dir ./
    # 改为
    # dir /home/
    #
    # requirepass foobared
    # 改为
    # requirepass fffabcd12345..11 #此处为想修改为的密码，可随意修改，并且requirepass前面没有井号则为起作用

# redis-server /etc/redis.conf #启动redis



########################################################
# node第三方库安装
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install pm2 -g
cnpm install http-proxy
cnpm install express
cnpm install body-parser
cnpm install fibers
cnpm install mysql
cnpm install ioredis
cnpm install request
cnpm install socket.io
########################################################