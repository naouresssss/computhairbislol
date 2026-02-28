import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
//récupére les enums dans le folder enums pour les réponses possibles
import { HairType } from "../enums/HairType";
import { EtatHair } from "../enums/EtatHair";
import { Cuirchevelu } from "../enums/CuirChevelu";
import { ChemicalTreatment } from "../enums/ChemicalTreatment";
import { Objectifs } from "../enums/Objectif";

@Entity()
export class ProfilCapillaire {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1er qst
  @Column({ type: "enum", enum: HairType })
  type!: HairType;

  // 2ème qst
  @Column({ type: "enum", enum: EtatHair })
  etatGeneral!: EtatHair;

  // etc
  @Column({ type: "enum", enum: Cuirchevelu })
  cuirChevelu!: Cuirchevelu;

  @Column({ type: "enum", enum: ChemicalTreatment })
  traitementChimique!: ChemicalTreatment;

  // liste d'objectifs donc c'est un type simple array []
  @Column("simple-array")
  objectifs!: Objectifs[];

  // lien vers l'utilisateur (user = profil)
  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;
}
