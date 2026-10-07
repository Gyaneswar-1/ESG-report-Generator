import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthCheck = asyncHandler((req: Request, res: Response) => {
  res.status(200).json(
    ApiResponse.ok(
      {
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      'Server is healthy'
    )
  );
});

export default { healthCheck };
