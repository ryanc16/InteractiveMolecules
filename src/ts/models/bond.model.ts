import { AtomModel } from "./atom.model";
import { BondType } from "../enums/bond-type.enum";

export class Bond implements BondModel {
  constructor(public atom1: AtomModel, public atom2: AtomModel, public bondType: BondType) {
  }
}

export interface BondModel {
  atom1: AtomModel;
  atom2: AtomModel;
  bondType: BondType;
}