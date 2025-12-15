import { env } from "./config/env.js";
import { buildApp } from "./app.js";

const app = buildApp();

app
  .listen({ port: env.PORT, host: "127.0.0.1" })
  .then((addr) => app.log.info(`Server listening at ${addr}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
