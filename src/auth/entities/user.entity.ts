import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'userId' })
  id: number;

  @Column({ nullable: false })
  email: string;

  @Column()
  userName: string;
  @Column()
  homePage: string;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
