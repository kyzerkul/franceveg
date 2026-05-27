import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verifyToken } from '@clerk/backend'
import type { Request } from 'express'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException()

    let userId: string
    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.getOrThrow('CLERK_SECRET_KEY'),
      })
      userId = payload.sub
    } catch {
      throw new UnauthorizedException()
    }

    const adminIds = (process.env.ADMIN_CLERK_IDS ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean)

    if (!adminIds.length || !adminIds.includes(userId)) {
      throw new ForbiddenException('Admin access required')
    }

    ;(req as Request & { clerkUserId: string }).clerkUserId = userId
    return true
  }
}
