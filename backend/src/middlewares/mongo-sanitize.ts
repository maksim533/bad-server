import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';

// Список опасных операторов MongoDB
const DANGEROUS_OPERATORS = [
  '$expr', '$function', '$where', '$eval', '$mapReduce',
  '$geoNear', '$near', '$nearSphere', '$text', '$search',
  '$comment', '$hint'
] as const;

type DangerousOperator = typeof DANGEROUS_OPERATORS[number];

type NestedObject = {
  [key: string]: any;
};

export const mongoSanitizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { query: queryParams } = req.query;

  const checkObject = (obj: NestedObject | null | undefined, path: string = ''): void => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (DANGEROUS_OPERATORS.includes(key as DangerousOperator)) {
        throw new BadRequestError(`Запрещённый оператор MongoDB: ${currentPath}`);
      }

      const value = obj[key];
      if (value && typeof value === 'object') {
        checkObject(value as NestedObject, currentPath);
      }
    });
  };

  try {
    checkObject(queryParams as NestedObject);
    next();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    res.status(400).json({
      error: 'Invalid query parameters',
      message: errorMessage
    });
  }
};