import { StoreModel } from "./model/storeModel.js";
import { StoreView } from "./view/storeView.js";
import { StoreController } from "./controller/storeController.js";

const model = new StoreModel();
const view = new StoreView();
new StoreController(model, view);

