import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile Use Case", () => {
  let useCase: ShowUserProfileUseCase;
  let usersRepository: InMemoryUsersRepository;
  let userId = "";

  const userDto: ICreateUserDTO = {
    email: "silasstofel@gmail.com",
    name: "Silas Stoffel",
    password: "53nh@.T0p",
  };

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    useCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to load user profile", async () => {
    const create = new CreateUserUseCase(usersRepository);
    const user = await create.execute(userDto);
    userId = user.id;

    const userAuth = await useCase.execute(userId);
    expect(userAuth.id).toBe(userId);
  });

  it("Should not be able to load user profile with invalid id", async () => {
    expect(async () => {
      await useCase.execute("invalid-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
