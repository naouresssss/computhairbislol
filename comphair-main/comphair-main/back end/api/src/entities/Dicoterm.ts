import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from "typeorm";
import { ImpactType } from "../enums/TypeimpactProduit";

@Entity()
export class DicoTerm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  slug!: string; //représentation textuelle simplifiée d'une ressource pour URL (expl Porosité slug=porosite)

  @Column()
  nom!: string;//nom qui apparait dans le front

  @Column("text")
  definition!: string;

  @Column({ nullable: true })
  categorie?: string;//type du mot

  @Column({
    type: "enum",
    enum: ImpactType,//impact parmis enum des impacts
    nullable: true,
  })
  impact?: ImpactType;//peut être null donc pas forcement d'impact
}
