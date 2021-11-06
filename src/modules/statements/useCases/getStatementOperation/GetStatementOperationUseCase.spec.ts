import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

describe("Get Statement Operation Use Case", () => {
  let statementRepository: IStatementsRepository;
  let userRepository: IUsersRepository;
  let useCase: GetStatementOperationUseCase;
  let createStatementUseCase: CreateStatementUseCase;
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
    useCase = new GetStatementOperationUseCase(
      userRepository,
      statementRepository
    );
    userId = user.id;
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
  });

  it("Should be able to load statement operation", async () => {
    const deposit = await createStatementUseCase.execute({
      user_id: userId,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Description",
    });

    const statement = await useCase.execute({
      statement_id: deposit.id,
      user_id: userId,
    });

    expect(statement).toHaveProperty("id", deposit.id);
    expect(statement).toHaveProperty("user_id", userId);
    expect(statement).toHaveProperty("amount", deposit.amount);
    expect(statement).toHaveProperty("type", OperationType.DEPOSIT);
  });

  it("Should not be able to load statement with invalid user id", async () => {
    await expect(async () => {
      await useCase.execute({ user_id: "invalid", statement_id: "13" });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to load statement with invalid statement id", async () => {
    await expect(async () => {
      await useCase.execute({ user_id: userId, statement_id: "invalid" });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
