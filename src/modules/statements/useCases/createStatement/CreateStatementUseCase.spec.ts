import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

describe("Create Statement Use Case", () => {
  let statementRepository: IStatementsRepository;
  let userRepository: IUsersRepository;
  let useCase: CreateStatementUseCase;
  let userId = "";

  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    const create = new CreateUserUseCase(userRepository);
    const user = await create.execute({
      email: "silasstofel@gmail.com",
      name: "Silas Stoffel",
      password: "53nh@.T0p",
    });
    statementRepository = new InMemoryStatementsRepository();
    useCase = new CreateStatementUseCase(userRepository, statementRepository);
    userId = user.id;
  });

  it("Should be able to create deposit statement", async () => {
    const deposit = await useCase.execute({
      user_id: userId,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Description",
    });
    expect(deposit).toHaveProperty("id");
    expect(deposit).toHaveProperty("user_id", userId);
    expect(deposit).toHaveProperty("amount", 100);
  });

  it("Should not be able to create statement with invalid id", async () => {
    await expect(async () => {
      await useCase.execute({
        user_id: "invalid",
        amount: 100,
        type: OperationType.DEPOSIT,
        description: "Description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create withdraw statement", async () => {
    const deposit = await useCase.execute({
      user_id: userId,
      amount: 60,
      type: OperationType.DEPOSIT,
      description: "Description",
    });

    const withdraw = await useCase.execute({
      user_id: userId,
      amount: 50,
      type: OperationType.WITHDRAW,
      description: "Description",
    });
    expect(withdraw).toHaveProperty("id");
    expect(withdraw).toHaveProperty("user_id", userId);
    expect(withdraw).toHaveProperty("amount", 50);
  });

  it("Should not be able to create withdraw statement if amount more than balance", async () => {
    await expect(async () => {
      await useCase.execute({
        user_id: userId,
        amount: 60,
        type: OperationType.DEPOSIT,
        description: "Description",
      });

      await useCase.execute({
        user_id: userId,
        amount: 70,
        type: OperationType.WITHDRAW,
        description: "Description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
