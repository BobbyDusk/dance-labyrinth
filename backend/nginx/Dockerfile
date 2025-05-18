FROM nginx

COPY ./nginx.conf /etc/nginx/nginx.conf
# COPY ./ssl /etc/nginx/ssl

# EXPOSE 443
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]