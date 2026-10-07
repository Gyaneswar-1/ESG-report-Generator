export class ApiResponse<T = unknown> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data?: T;

  constructor(statusCode: number, data?: T, message: string = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  public static ok<T>(data?: T, message = 'Success') {
    return new ApiResponse<T>(200, data, message);
  }
}

export default ApiResponse;
