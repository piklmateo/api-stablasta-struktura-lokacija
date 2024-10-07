import NodeDAO from "./nodeDAO.js";

class NodeRest {
  constructor() {}

  async getTree(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      const tree = await ndao.getTree();
      res.send(JSON.stringify(tree));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getNode(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      let id = req.params.id;

      if (!id) return res.status(400).json({ error: "Node doesn't exist" });

      const node = await ndao.getNode(id);
      if (!node) return res.status(404).json({ error: "Node not found" });

      res.send(JSON.stringify(node));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async postNode(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      const data = req.body;
      const parentId = req.params.parent_node_id;

      if (!data.title) return res.status(400).json({ error: "Invalid data" });
      if (!parentId) return res.status(400).json({ error: "Invalid parent id" });

      const node = await ndao.insertNode(data, parentId);
      res.send(JSON.stringify(node));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async putNode(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();

      const data = req.body;
      const id = req.params.id;

      if (!data.title) return res.status(400).json({ error: "Invalid data" });
      if (!id) return res.status(400).json({ error: "Invalid id" });

      const node = await ndao.updateNode(data, id);
      res.send(JSON.stringify(node));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteNode(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      const id = req.params.id;

      if (!Number(id)) return res.status(400).json({ error: "Invalid id" });
      if (Number(id) === 1) return res.status(400).json({ error: "Root node cannot be deleted" });

      const node = await ndao.deleteNode(id);
      res.send(JSON.stringify(node));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async rearangeNodeNewParent(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      const id = req.params.id;
      const parentId = req.params.parent_node_id;
      console.log(id);

      if (!Number(id) || !Number(parentId)) return res.status(400).json({ error: "Invalid id" });
      if (Number(id) === 1) return res.status(400).json({ error: "Root element cannot be rearanged" });

      const data = await ndao.rearangeNodeNewParent(id, parentId);
      res.send(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async reorderNodesInParent(req, res) {
    res.type("application/json");
    try {
      let ndao = new NodeDAO();
      const id = req.params.id;
      const parentId = req.params.parent_node_id;
      const ordering = req.params.ordering;

      if (!Number(id) || !Number(parentId) || !Number(ordering)) return res.status(400).json({ error: "Invalid data" });

      const data = await ndao.reorderNodesInParent(id, parentId, ordering);
      res.send(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default NodeRest;
