import type { Dict } from "../translate";
import app from "./app";
import auth from "./auth";
import common from "./common";
import enterprise from "./enterprise";
import landing from "./landing";
import legal from "./legal";
import trainer from "./trainer";

const parts = [common, landing, auth, app, trainer, enterprise, legal];
export const DICT: Dict = {
  fr: Object.assign({}, ...parts.map((p) => p.fr)),
  ar: Object.assign({}, ...parts.map((p) => p.ar)),
};
