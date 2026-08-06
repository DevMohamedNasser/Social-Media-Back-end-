import chalk from "chalk";
import bootstrap from "./app.controller";

bootstrap().catch((error: unknown) => {
    chalk.red( console.log(`Failed to start App`, error));
    process.exit(1);
})