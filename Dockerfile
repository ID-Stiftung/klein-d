FROM nginx:1.27-alpine
RUN apk add --no-cache apache2-utils
COPY nginx.conf.template /etc/nginx/klein-d.conf.template
COPY 40-auth.sh /docker-entrypoint.d/40-auth.sh
RUN chmod +x /docker-entrypoint.d/40-auth.sh
COPY public/ /usr/share/nginx/html/
EXPOSE 80
