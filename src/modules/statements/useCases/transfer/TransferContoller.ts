import { Response, Request } from "express";
import { container } from "tsyringe";
import { TransferUseCase } from "./TransferUseCase";

export class TransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { amount } = request.body;
    const receiverId = request.params.user_id;

    const useCase = container.resolve(TransferUseCase);

    await useCase.execute({
      amount,
      userIdDestination: receiverId,
      userIdOrigin: request.user.id,
    });

    return response.status(204).json();
  }
}
