import { z } from 'zod';

export const proxyRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z
    .string()
    .url({ message: 'Invalid URL. Must include protocol (http:// or https://).' }),
  headers: z.record(z.string()).optional().default({}),
  params: z.record(z.string()).optional().default({}),
  body: z.union([z.string(), z.record(z.unknown()), z.null()]).optional(),
  bodyType: z
    .enum(['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'])
    .optional()
    .default('none'),
  auth: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('none') }),
      z.object({ type: z.literal('bearer'), token: z.string() }),
      z.object({
        type: z.literal('basic'),
        username: z.string(),
        password: z.string(),
      }),
      z.object({
        type: z.literal('api-key'),
        key: z.string(),
        value: z.string(),
        in: z.enum(['header', 'query']),
      }),
    ])
    .optional()
    .default({ type: 'none' }),
  timeout: z.number().min(100).max(60000).optional().default(30000),
});

export type ProxyRequestInput = z.infer<typeof proxyRequestSchema>;
