import {MigrationInterface, QueryRunner} from "typeorm";

export class SetNullSenderId1637519706964 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE statements ALTER COLUMN sender_id DROP NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE statements ALTER COLUMN sender_id DROP NULL");
    }

}
