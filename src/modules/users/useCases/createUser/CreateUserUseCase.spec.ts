import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

describe("Create user use case", () => {
  let useCase: CreateUserUseCase;
  const userDto: ICreateUserDTO = {
    email: "silasstofel@gmail.com",
    name: "Silas Stoffel",
    password: "53nh@.T0p",
  };

  beforeEach(() => {
    useCase = new CreateUserUseCase(new InMemoryUsersRepository());
  });

  it("Should be able to create user", async () => {
    const user = await useCase.execute(userDto);
    expect(user).toHaveProperty("id");
    expect(user.name).toEqual(userDto.name);
    expect(user.email).toEqual(userDto.email);
  });

  it("Should not be able to create user with account already exist", async () => {
    await expect(async () => {
      await useCase.execute(userDto);
      await useCase.execute(userDto);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
