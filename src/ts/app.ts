import { } from 'three';
import { Molecule } from './models/molecule.model';
import { Atom } from './models/atom.model';

const ATOMS = {
  HYDROGEN: new Atom('Hydrogen', 'H', 1, 1.0000000000000, {bgColor: '#e5e5e5', textColor: '#333333'}).clone(),
  OXYGEN: new Atom('Oxygen', 'O', 8, 2.1290322580645, {bgColor: '#cc3333', textColor: '#e5e5e5'}).clone()
};

let mol = new Molecule('Water', 'H2O');
const hydrogen1 = ATOMS.HYDROGEN;
const hydrogen2 = ATOMS.HYDROGEN;
const oxygen = ATOMS.OXYGEN;
mol.addAtom(hydrogen1);
mol.addAtom(hydrogen2);
mol.addAtom(oxygen);
mol.addBond(hydrogen1, oxygen);
mol.addBond(hydrogen2, oxygen);

console.log(mol);