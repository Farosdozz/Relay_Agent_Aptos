import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from './common/config/config';

export default (app: INestApplication) => {
  if (config.swagger.is_auth) {
    app.use(
      config.swagger.doc_url,
      //   basicAuth({
      //     challenge: true,
      //     users: {
      //       [config.swagger.username]: config.swagger.password,
      //     },
      //   }),
    );
  }

  const options = new DocumentBuilder()
    .setTitle(config.swagger.name)
    .setDescription(config.swagger.description)
    .setVersion(config.swagger.version)
    .addBearerAuth()
    // .addServer("")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(config.swagger.doc_url, app, document, {
    // customJs: '/public/custom-sg.js',
    // customCssUrl: '/public/style.css',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
};
