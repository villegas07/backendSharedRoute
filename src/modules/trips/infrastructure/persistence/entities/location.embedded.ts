import { Column } from 'typeorm';

export class LocationEmbedded {
  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column()
  address: string;

  @Column()
  city: string;
}
