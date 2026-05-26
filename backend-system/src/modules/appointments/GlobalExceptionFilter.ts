import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // Obtener el response de manera más directa
    const response = ctx.getResponse();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error inesperado';
    
    // Log del error con más detalles
    this.logger.error(exception);
    
    //BusinessException y HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errorResponse = exceptionResponse as any;
        if (Array.isArray(errorResponse.message)) {
          message = errorResponse.message[0];
        } else {
          message = errorResponse.message || message;
        }
      }
    } 
    else if (exception instanceof Error) {
      message = exception.message;
    }
    
    try {
      response.status(status).send({
        message: message,
        statusCode: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error al enviar respuesta:', error);
      response.status(500).send({
        message: 'Error interno del servidor',
      });
    }
  }
}