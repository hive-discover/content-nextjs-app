# Source: https://blog.zack.computer/docker-containers-nodejs-nextjs
# We're starting with the same base image, but we're declaring
# that this block outputs an image called DEPS that we
# won't be deploying - it just installs our Yarn deps
FROM node:14-alpine AS deps

# If you need libc for any of your deps, uncomment this line:
RUN apk add --no-cache libc6-compat

# Copy over ONLY the package.json and yarn.lock
# so that this `yarn install` layer is only recomputed
# if these dependency files change. Nice speed hack!
WORKDIR /app
COPY package.json ./
RUN yarn install --frozen-lockfile

# END DEPS IMAGE

# Now we make a container to handle our Build
FROM node:14-alpine AS builder

# Set up our work directory again
WORKDIR /app

# Bring over the deps we installed and now also
# the rest of the source code to build the Next
# server for production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Remove all the development dependencies since we don't
# need them to run the actual server.
RUN rm -rf node_modules
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

# END OF builder

# This starts our application's run image - the final output of build.
FROM node:14-alpine as app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Pull the built files out of builder - we need:
# 1. the package.json and yarn.lock
# 2. the Next build output and static files
# 3. the node_modules.
WORKDIR /app
# /app/yarn.lock is not needed for production

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

# 4. OPTIONALLY the next.config.js, if your app has one
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js  ./

USER nextjs

EXPOSE 3000

CMD [ "yarn", "start" ]