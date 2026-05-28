'use strict'
require('reflect-metadata')
const { NestFactory } = require('@nestjs/core')
const { ValidationPipe } = require('@nestjs/common')
const { ExpressAdapter } = require('@nestjs/platform-express')
const express = require('express')

const expressApp = express()
let ready = null

function bootstrap() {
  if (ready) return ready

  ready = (async () => {
    // Use a variable to prevent esbuild from statically bundling the dist files.
    // nest build (tsc) compiles src/ → dist/ with emitDecoratorMetadata intact.
    const modulePath = '../dist/src/app.module'
    const { AppModule } = require(modulePath)

    const adapter = new ExpressAdapter(expressApp)
    const app = await NestFactory.create(AppModule, adapter, { rawBody: true })

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
    ].filter(Boolean)

    app.enableCors({ origin: allowedOrigins, credentials: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')

    await app.init()
    return expressApp
  })()

  return ready
}

module.exports = async (req, res) => {
  const server = await bootstrap()
  server(req, res)
}
