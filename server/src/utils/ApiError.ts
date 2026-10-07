export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: unknown[];

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: unknown[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message = 'Bad Request', errors: unknown[] = []) {
    return new ApiError(400, message, errors);
  }

  public static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  public static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

export default ApiError;
