import { ValidationError } from '@nestjs/common';
interface ErrorObject {
  property: string;
  message: string;
}
export function getAllConstraints(errors: ValidationError[]): ErrorObject[] {
  const constraints = [];

  for (const error of errors) {
    // map message array to object
    const objectError = {
      property: error.property,
      message: Object.values(error.constraints).join(', '),
    };
    constraints.push(objectError);
  }

  return constraints;
}

export function getCustomValidationError(message: ErrorObject[]) {
  // make message an object
  return {
    statusCode: 400,
    message,
    error: 'Bad Request',
  };
}
