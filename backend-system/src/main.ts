import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { GlobalExceptionFilter } from "./modules/appointments/GlobalExceptionFilter";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
  origin: [
    //'http://150.230.180.25:4000',
    'http://localhost:4000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

await app.listen(3000/*, '0.0.0.0' */);
  
  const dataSource = app.get<DataSource>(getDataSourceToken());
}
bootstrap();