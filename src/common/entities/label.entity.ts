import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity, Task } from 'common/entities';

@Entity()
export class Label extends CoreEntity {
  @Column({ type: 'varchar', name: 'color', default: '' })
  color: string;

  @Column({ type: 'varchar', name: 'text', default: '' })
  text: string;

  @Column({ type: 'varchar', name: 'order', default: '' })
  order: string;

  @ManyToOne(() => Task, (task) => task.labels)
  task: Task;
}
