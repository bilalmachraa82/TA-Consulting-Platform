FROM apify/actor-node-playwright-chrome:18

COPY package*.json ./
RUN npm install --omit=dev

COPY . ./
RUN npm run build

CMD npm run start
