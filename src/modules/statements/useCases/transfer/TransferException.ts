import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferException {
  export class UserNotFound extends AppError {
    constructor(id: string = '') {
      const userId = id ? `(${id})` : '';
      const message = `User${userId} not found`;
      super(message, 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

}
