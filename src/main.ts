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

  app.enableCors(); // Enable CORS for all origins

  await app.listen(3000);
  
  const dataSource = app.get<DataSource>(getDataSourceToken());
  //const initDataService = new InitDataService(dataSource);
  //await initDataService.seedIfEmpty();
}
bootstrap();