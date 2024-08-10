import { Request, Response, NextFunction } from "express";
import APIError from "../utils/apiError";
import { environment } from "../utils/environment";
import { logger } from "../utils/logger";

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    if (error instanceof APIError || error.httpStatus) {
        res.status(error.httpStatus).json({
            message: error.message
        });
    } else {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode);
        res.json({
            message: error.message,
            stack: environment.status === "development" ? error.stack : "",
        });
    }
};