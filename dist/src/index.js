"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const schema_1 = require("./schema");
const db_1 = require("./db");
const auth_1 = require("./utils/auth");
const server = new server_1.ApolloServer({ schema: schema_1.schema });
const port = Number.parseInt(process.env.PORT) || 4000;
const start = async () => {
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        context: async ({ req, res }) => ({
            db: db_1.db,
            token: req && req.headers.authorization
                ? (0, auth_1.decodeAuthHeader)(req.headers.authorization)
                : null,
        }),
        listen: { port: port },
    });
    console.log(`🚀  Server ready at: ${url}`);
};
start();
//# sourceMappingURL=index.js.map