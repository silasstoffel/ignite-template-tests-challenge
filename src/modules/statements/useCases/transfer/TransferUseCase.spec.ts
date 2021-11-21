import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { TransferUseCase } from "./TransferUseCase";
import { User } from "../../../users/entities/User";
import { TransferException } from "./TransferException";

describe("TransferUseCase", () => {
  let useCase: TransferUseCase;
  let userRepository: IUsersRepository;
  let statementRepository: IStatementsRepository;
  let sender: User;
  let receiver: User;

  const userSender = new User();
  Object.assign(userSender, {
    email: "sender@example.com",
    name: "user-sender",
    password: "123456",
  });

  const userReceiver = new User();
  Object.assign(userReceiver, {
    email: "receiver@example.com",
    name: "user-receiver",
    password: "123456",
  });

  beforeEach(async () => {
    statementRepository = new InMemoryStatementsRepository();
    userRepository = new InMemoryUsersRepository();

    sender = await userRepository.create(userSender);
    receiver = await userRepository.create(userReceiver);

    await statementRepository.create({
      amount: 100,
      description: "Create",
      type: OperationType.DEPOSIT,
      user_id: sender.id,
    });

    useCase = new TransferUseCase(userRepository, statementRepository);
  });

  it("Should be able to do a transfer", async () => {
    const createTransfer = jest.spyOn(statementRepository, "create");
    const checkUser = jest.spyOn(userRepository, "findById");
    const getUserBalance = jest.spyOn(statementRepository, "getUserBalance");

    await useCase.execute({
      amount: 100,
      userIdOrigin: sender.id,
      userIdDestination: receiver.id,
    });

    const checkBalance = await statementRepository.getUserBalance({
      user_id: sender.id,
      with_statement: true,
    });

    const balanceAccountDestination = await statementRepository.getUserBalance({
      user_id: receiver.id,
      with_statement: true,
    });

    expect(createTransfer).toHaveBeenCalled();
    expect(checkUser).toHaveBeenCalled();
    expect(getUserBalance).toHaveBeenCalled();
    expect(checkBalance.balance).toBe(0);
    expect(balanceAccountDestination.balance).toBe(100);
  });

  it("Should be not able to do a transfer if exists invalid account destination", async () => {
    await expect(async () => {
      await useCase.execute({
        amount: 100,
        userIdOrigin: sender.id,
        userIdDestination: "invalid-account",
      });
    }).rejects.toBeInstanceOf(TransferException.UserNotFound);
  });

  it("Should be not able to do a transfer if exists insufficient funds", async () => {
    await expect(async () => {
      await useCase.execute({
        amount: 100000,
        userIdOrigin: sender.id,
        userIdDestination: receiver.id,
      });
    }).rejects.toBeInstanceOf(TransferException.InsufficientFunds);
  });

});
