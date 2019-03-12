import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectID,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "developers" })
class Developer {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  language: string;

  @Column()
  experienceLevel: number;

  @Column()
  animal: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column({
    nullable: true,
    type: "date"
  })
  migratedAt: string;
}

export default Developer;
