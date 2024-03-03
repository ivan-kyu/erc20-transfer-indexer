import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"] // add "debug" here
  });

  const apiConfig = new DocumentBuilder()
      .setTitle("ERC20 Transfer Event Indexer")
      .setVersion("1.0")
      .build();
    const document = SwaggerModule.createDocument(app, apiConfig);
    SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();