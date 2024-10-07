import express from "express";
import env from "dotenv";
import NodeRest from "./service/api/nodeRest.js";

env.config();
const restNode = new NodeRest();
const server = express();
const port = process.env.SERVER_PORT;

const startServer = () => {
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  prepareNodePaths();

  server.use((req, res) => {
    res.status(404);
    let message = { error: "Page not found" };
    res.json(message);
  });

  server.listen(port, () => {
    console.log("Server is running at: http://localhost:" + port);
  });
};

//Implementirano slanje podataka u url-u radi lakšeg testiranja
const prepareNodePaths = () => {
  server.get("/api/node", restNode.getTree);
  server.get("/api/node/:id", restNode.getNode);

  server.post("/api/node/:parent_node_id", restNode.postNode);

  server.put("/api/node/:id", restNode.putNode);
  server.put("/api/node/rearange/:id/:parent_node_id", restNode.rearangeNodeNewParent);
  server.put("/api/node/reorder/:id/:parent_node_id/:ordering", restNode.reorderNodesInParent);

  server.delete("/api/node/:id", restNode.deleteNode);
};

startServer();
