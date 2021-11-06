import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate User Use Case", () => {
  let useCase: AuthenticateUserUseCase;
  let usersRepository: InMemoryUsersRepository;

  const userDto: ICreateUserDTO = {
    email: "silasstofel@gmail.com",
    name: "Silas Stoffel",
    password: "53nh@.T0p",
  };

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    const createAccount = new CreateUserUseCase(usersRepository);
    await createAccount.execute(userDto);
    useCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate user", async () => {
    const auth = await useCase.execute(userDto);
    expect(auth.user.email).toBe(userDto.email);
    expect(auth.user.name).toBe(userDto.name);
  });

  it("Should be able to authenticate user if email not exists", async () => {
    await expect(async () => {
      userDto.email = "invalid@email.com";
      await useCase.execute(userDto);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should be able to authenticate user if password is incorrect", async () => {
    await expect(async () => {
      userDto.password = "invalid@email.com";
      await useCase.execute(userDto);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
