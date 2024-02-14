import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity, Task } from 'common/entities';

@Entity()
export class Label extends CoreEntity {
  @Column({ type: 'varchar', name: 'color', default: '' })
  title: string;

  @Column({ type: 'varchar', name: 'text', default: '' })
  content: string;

  @Column({ type: 'varchar', name: 'order', default: '' })
  order: string;

  @ManyToOne(() => Task, (task) => task.labels)
  task: Task;
}
