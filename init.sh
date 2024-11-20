#!/bin/bash

echo "welcome to taskServ"

# app
cd ./taskserv/src


# unfortunate fastify-zod
npm install --legacy-peer-deps

npm run build

cp .env ../dist/.env
echo "env file copied to dist!"

npm run dev

read pdeps