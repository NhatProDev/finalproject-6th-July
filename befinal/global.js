require('dotenv').config(); //Load enviroment .env variables

const myGlobal = {
    binding_PORT: 8003,
    db_config: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        cluster: process.env.DB_CLUSTER,
        option: process.env.DB_OPTIONS
    }
};

module.exports = myGlobal;