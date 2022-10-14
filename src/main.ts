import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Callback, Context, Handler } from "aws-lambda";
import { configure as serverlessExpress } from "@vendia/serverless-express";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AuthHeaders } from "./enums/auth-header.enum";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["debug"],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("api");
  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });

  /* API Documentation with Swagger */
  const config = new DocumentBuilder()
    .setDescription("API documentation")
    .setVersion("1.0")
    .addApiKey({ type: "apiKey" }, AuthHeaders.API_KEY)
    .addApiKey({ type: "apiKey" }, AuthHeaders.USER)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("documentation", app, document);

  await app.listen(3000);

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
if (process.env.NODE_ENV === "development") {
  bootstrap();
}

let server: Handler;
export const lambdaHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
