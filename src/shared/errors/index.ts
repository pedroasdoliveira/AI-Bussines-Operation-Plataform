export class AppError extends Error {
  readonly errorCode: string;

  constructor(errorCode: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.errorCode = errorCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Acesso negado.") {
    super("DENIED", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("NOT_FOUND", message);
  }
}

export class DomainError extends AppError {
  constructor(errorCode: string, message: string) {
    super(errorCode, message);
  }
}

export class PolicyViolationError extends AppError {
  constructor(message: string) {
    super("POLICY_VIOLATION", message);
  }
}

export class UnexpectedError extends AppError {
  constructor(message = "Erro inesperado.") {
    super("FAILED", message);
  }
}

export class ProviderError extends AppError {
  constructor(message: string) {
    super("PROVIDER_ERROR", message);
  }
}
