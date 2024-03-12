import { connect } from "./connecte";
import * as model from "../__models";

const initialize = () => {

    // model.ModelAction.belongsTo(model.ModelEvenement);

    connect
        .sync({ alter: true })
        .then(() => {
            console.log("All models were synchronized successfully to DB ====> .");
        })
        .catch((error) => {
            console.log(`Failed to sync all models ${error.message}`);
        });
};

export { initialize };
