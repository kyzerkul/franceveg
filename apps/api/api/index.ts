import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ExpressAdapter } from '@nestjs/platform-express'
import { AppModule } from '../src/app.module'
import * as express from 'express'
import type { Request, Response } from 'express'

const expressApp = express()
let ready: Promise<typeof expressApp> | null = null

function bootstrap() {
  if (ready) return ready

  ready = (async () => {
    const adapter = new ExpressAdapter(expressApp)
    const app = await NestFactory.create(AppModule, adapter, { rawBody: true })

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
    ].filter((o): o is string => Boolean(o))

    app.enableCors({ origin: allowedOrigins, credentials: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')

    await app.init()
    return expressApp
  })()

  return ready
}

export default async (req: Request, res: Response) => {
  const server = await bootstrap()
  server(req, res)
}
