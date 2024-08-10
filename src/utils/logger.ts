import { createConsola } from "consola";
import { environment } from "./environment";

export const logger = createConsola({
    fancy: true,
    level: parseInt(environment?.logLevel ?? "4"),
})