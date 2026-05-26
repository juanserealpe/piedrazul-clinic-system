import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    const response =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as any) || {};

    res.status(status).json({
      success: false,
      code: response.code || 'INTERNAL_ERROR',
      message: response.message || 'Unexpected error',
    });
  }
}