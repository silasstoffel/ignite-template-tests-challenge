import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class CreateTransferColumns1637449281953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const column = new TableColumn({
      name: "sender_id",
      type: "uuid"
    });

    await queryRunner.addColumn("statements", column);

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
          name: "FKUserSenderStatements",
          referencedTableName: "users",
          referencedColumnNames: ["id"],
          columnNames: ["sender_id"],
          onDelete: "no action",
          onUpdate: "no action",
      })
  );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "sender_id");
  }
}
