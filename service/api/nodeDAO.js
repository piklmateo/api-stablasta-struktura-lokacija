import DB from "../database/database.js";

class NodeDAO {
  constructor() {
    this.db = new DB();
  }

  async getTree() {
    try {
      const sql = `SELECT * FROM node`;
      const data = await this.db.query(sql, []);
      const rows = data.rows;
      return rows;
    } catch (error) {
      console.error("Error while fetching tree: ", error);
      throw error;
    }
  }

  async getNode(id) {
    try {
      const sql = `SELECT * FROM node WHERE id = $1`;
      const data = await this.db.query(sql, [id]);
      const rows = data.rows;
      return rows.length === 1 ? rows[0] : null;
    } catch (error) {
      console.error("Error while fetching node: ", error);
      throw error;
    }
  }

  async getParentId(id) {
    try {
      const sql = `SELECT parent_node_id FROM node WHERE id = $1`;
      const data = await this.db.query(sql, [id]);
      const rows = data.rows;
      return rows[0].parent_node_id;
    } catch (error) {
      console.error("Error while fetching node: ", error);
      throw error;
    }
  }

  async getChildren(parentId) {
    try {
      const sql = `SELECT * FROM node WHERE parent_node_id = $1`;
      const data = await this.db.query(sql, [parentId]);
      const rows = data.rows;
      return rows;
    } catch (error) {
      console.error("Error while fetching node: ", error);
      throw error;
    }
  }

  async insertNode(node, parentId) {
    try {
      const nextOrdering = await this.getMaxOrdering(parentId);

      const sql = `INSERT INTO node (title, parent_node_id, ordering) VALUES ($1, $2, $3)`;
      const data = [node.title, parentId, nextOrdering];
      await this.db.query(sql, data);

      return true;
    } catch (error) {
      console.error("Error while inserting node: ", error);
      throw error;
    }
  }

  //update je napravljen da se ažurira samo title,
  //jer već postoje metode za premještanje unutar parent-a i ordering u kasnijim zadacima.
  async updateNode(node, id) {
    try {
      const sql = `UPDATE node SET title=$1 WHERE id=$2`;
      const data = [node.title, id];
      await this.db.query(sql, data);
      return true;
    } catch (error) {
      console.error("Error while updating node: ", error);
      throw error;
    }
  }

  async deleteNode(id) {
    try {
      const parentId = await this.getParentId(id);
      const children = await this.getChildren(parentId);
      const orderingLenght = await this.getMaxOrdering(parentId, false);

      const sql = `DELETE from node WHERE id = $1 OR parent_node_id = $2`;
      for (let i = 0; i < orderingLenght; i++) {
        await this.db.query(sql, [id, id]);
      }

      for (let i = 0; i < children.length; i++) {
        const updateSql = `UPDATE node SET ordering = $1 WHERE id = $2`;
        await this.db.query(updateSql, [children[i].ordering - 1, children[i].id]);
      }

      return true;
    } catch (error) {
      console.error("Error while deleting node: ", error);
      throw error;
    }
  }

  async rearangeNodeNewParent(id, newParentId) {
    try {
      const node = await this.getNode(id);
      const nodeOldOrdering = node.ordering;
      const nodeOldParentId = node.parent_node_id;
      const nextOrdering = await this.getMaxOrdering(newParentId);

      //Update cvora na novi parent
      const sql = `UPDATE node SET parent_node_id=$1, ordering=$2 WHERE id = $3`;
      const data = [newParentId, nextOrdering, id];
      await this.db.query(sql, data);

      console.log("IZVRSENO");

      //Ponovni izracun ordering za stari cvor
      const children = await this.getChildren(Number(nodeOldParentId));
      for (let i = 0; i < children.length; i++) {
        const updatechildrenSql = `UPDATE node SET ordering=$1 WHERE id=$2`;
        const newChildrenData = [children[i].ordering < nodeOldOrdering ? children[i].ordering : children[i].ordering - 1, children[i].id];
        await this.db.query(updatechildrenSql, newChildrenData);
        console.log("newChildrenData: ", newChildrenData);
      }

      console.log("oldParentId: ", nodeOldParentId);
      return true;
    } catch (error) {
      console.error("Error while rearanging node: ", error);
      throw error;
    }
  }

  async reorderNodesInParent(id, parentId, newOrdering) {
    try {
      const children = await this.getChildren(parentId);
      const nodeToReorder = children.find((child) => child.id === Number(id));

      const remainingChildren = children.filter((child) => child.id !== Number(id));
      remainingChildren.sort((a, b) => a.ordering - b.ordering);
      remainingChildren.splice(newOrdering - 1, 0, nodeToReorder);

      for (let i = 0; i < remainingChildren.length; i++) {
        remainingChildren[i].ordering = i + 1;
      }

      for (let i = 0; i < remainingChildren.length; i++) {
        const updateSql = `UPDATE node SET ordering=$1 WHERE id=$2 AND parent_node_id=$3`;
        const updateData = [remainingChildren[i].ordering, remainingChildren[i].id, parentId];
        await this.db.query(updateSql, updateData);
      }

      return true;
    } catch (error) {
      console.error("Error while reordering nodes: ", error);
      throw error;
    }
  }

  async getMaxOrdering(parentId, increment = true) {
    try {
      const maxOrderSql = `SELECT COALESCE(MAX(ordering), 0) AS max_ordering FROM node WHERE parent_node_id = $1`;
      const maxOrderResult = await this.db.query(maxOrderSql, [parentId]);
      return increment ? maxOrderResult.rows[0].max_ordering + 1 : maxOrderResult.rows[0].max_ordering;
    } catch (error) {
      console.error("Error while fetching max ordering: ", error);
      throw error;
    }
  }
}

export default NodeDAO;
