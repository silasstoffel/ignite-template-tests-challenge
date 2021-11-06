import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

describe("Get Balance Use Case", () => {
  let statementRepository: IStatementsRepository;
  let userRepository: IUsersRepository;
  let useCase: GetBalanceUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    useCase = new GetBalanceUseCase(statementRepository, userRepository);
  });

  it("Should be able to load balance on an user", async () => {
    const create = new CreateUserUseCase(userRepository);
    const user = await create.execute({
      email: "silasstofel@gmail.com",
      name: "Silas Stoffel",
      password: "53nh@.T0p",
    });

    const balance = await useCase.execute({ user_id: user.id});
    expect(balance).toHaveProperty('balance');
    expect(balance).toHaveProperty('statement');
  });

  it("Should not be able to load balance with invalid user id", async () => {
    await expect(async() => {
      await useCase.execute({ user_id: 'invalid'})
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
