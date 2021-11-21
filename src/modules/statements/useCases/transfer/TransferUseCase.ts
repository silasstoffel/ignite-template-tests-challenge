import { inject, injectable } from "tsyringe";

import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import {TransferException} from "./TransferException";
import { TransferDTO } from "./TransferDTO";
import { OperationType } from "../../entities/Statement";

@injectable()
export class TransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute(params: TransferDTO): Promise<void> {
    const receiver = await this.usersRepository.findById(params.userIdDestination);
    if (!receiver) {
      throw new TransferException.UserNotFound(params.userIdDestination);
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id: params.userIdOrigin, with_statement: true
    });

    if (balance.balance < params.amount) {
      throw new TransferException.InsufficientFunds();
    }

    // debit
    await this.statementsRepository.create({
      amount: params.amount,
      description: 'Amount transfer',
      type: OperationType.TRANSFER,
      user_id: params.userIdOrigin
    });

    // credit
    await this.statementsRepository.create({
      amount: params.amount,
      description: 'Receive a transfer',
      type: OperationType.TRANSFER,
      user_id: params.userIdDestination,
      sender_id: params.userIdOrigin
    });
  }
}
