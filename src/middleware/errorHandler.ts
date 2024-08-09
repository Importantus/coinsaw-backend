import { Request, Response, NextFunction } from "express";
import APIError from "../utils/apiError";
import { environment } from "../utils/environment";

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    if (error instanceof APIError) {
        res.status(error.status).json(error.toJSON());
    } else {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode);
        res.json({
            message: error.message,
            stack: environment.status === "development" ? error.stack : "",
        });
    }
};