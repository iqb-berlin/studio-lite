import { HttpException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return formatted response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as unknown as Response;

    const mockRequest = {
      url: '/test-url'
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ArgumentsHost;

    const mockException = new HttpException(
      { key: 'value' },
      400
    );

    filter.catch(mockException, mockArgumentsHost);

    expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Http Exception',
        custom: { key: 'value' },
        endpoint: '/test-url'
      })
    );
    expect((mockResponse.json as jest.Mock).mock.calls[0][0]).toHaveProperty('timestamp');
  });

  it('should handle custom message in HttpException', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as unknown as Response;

    const mockRequest = {
      url: '/test-url'
    } as unknown as Request;

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest)
      })
    } as unknown as ArgumentsHost;

    const mockException = new HttpException('Custom Error Message', 404);

    filter.catch(mockException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Custom Error Message',
        endpoint: '/test-url'
      })
    );
  });
});
