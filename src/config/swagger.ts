import swaggerJSDoc from "swagger-jsdoc";
import { SwaggerUiOptions } from "swagger-ui-express";

const options : swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.2',
    tags: [
      {
        name: 'Products',
        description: 'API operations related to products'
      }
    ],
    info: {
      title: 'REST API Node.js / Express / TypeScript',
      version: "1.0.0",
      description: "API Docs for Products"
    }
  },
  apis: ['./src/router.ts']
}

const swaggerSpec = swaggerJSDoc(options)

const swaggerUiOptions : SwaggerUiOptions = {
  customCss: `
    .topbar-wrapper .link {
      content: url('https://www.thewitcher.com/build/images/tw3-logo-dark-en@2x-ae530c30..png');
      height: auto;
      width: 100px;
    }
    .swagger-ui .topbar {
      background-color:rgb(183, 183, 184);
    }
  `,
  customSiteTitle: 'Documentación REST API Express / TypeScript'
}

export default swaggerSpec
export {
  swaggerUiOptions
}