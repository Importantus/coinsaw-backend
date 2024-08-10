export default class APIError extends Error {
    httpStatus: number;

    private constructor(message: string, status: number) {
        super(message);
        this.httpStatus = status;
    }

    get JSON() {
        return {
            message: this.message
        }
    }

    static notAuthorized() {
        return new APIError("Not authorized", 401);
    }

    static forbidden() {
        return new APIError("Forbidden", 403);
    }

    static notFound() {
        return new APIError("Not found", 404);
    }

    static badRequest(message: any) {
        return new APIError("Bad request: " + message, 400);
    }

    static internalServerError(message: any) {
        return new APIError("Internal server error: " + message, 500);
    }
}