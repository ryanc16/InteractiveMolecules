import { AtomModel } from "./atom.model";
import { BondModel, Bond } from "./bond.model";
import { BondType } from "../enums/bond-type.enum";

export class Molecule implements MoleculeModel {

  atoms: AtomModel[] = [];
  bonds: BondModel[] = [];

  constructor(public name: string, public abbr: string) {
  }

  addAtom(atom: AtomModel) {
    this.atoms.push(atom);
  }

  addBond(atom1: AtomModel, atom2: AtomModel, bondType: BondType = BondType.SINGLE) {
    this.bonds.push(new Bond(atom1, atom2, bondType));
  }
}

export interface MoleculeModel {
  name: string;
  abbr: string;
  atoms: AtomModel[];
  bonds: BondModel[];
}