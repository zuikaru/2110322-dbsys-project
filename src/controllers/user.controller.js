const db = require("../services/database");
const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");
const User = require("../models/user");

const controller = {
  async findAllUsers() {
    const sql = "CALL get_customer_detail();";
    const [result] = await db.query(sql, { type: QueryTypes.SELECT });
    const documents = Object.values(result);
    const filteredDocuments = [];
    const ids = new Map();
    documents.forEach((doc, idx) => {
      if (ids[doc.user_id]) {
        const mainDoc = documents[ids[doc.user_id]];
        delete doc.user_id;
        ["address", "phone_number", "email"].forEach((key) => {
          mainDoc[key].add(doc[key]);
        });
      } else {
        ids[doc.user_id] = idx;
        ["address", "phone_number", "email"].forEach((key) => {
          doc[key] = new Set([doc[key]]);
        });
      }
    });
    documents.forEach((doc) => {
      if (doc.user_id) {
        ["address", "phone_number", "email"].forEach((key) => {
          doc[key] = Array.from(doc[key]);
          if (doc[key].length === 1) {
            doc[key] = doc[key][0];
          } else if (doc[key].length === 0) {
            doc[key] = "";
          }
        });
        filteredDocuments.push(doc);
      }
    });
    return filteredDocuments;
  },
  /**
   * Get users
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async getUsers(req, res) {
    // DB
    try {
      const docs = await controller.findAllUsers();
      const search = req.query.search;
      if (search) {
        res.locals.message.push({
          type: "info",
          text: `You entered "${search}"`
        });
      }
      res.render("user", {
        title: "List of users",
        result: docs
      });
    } catch (err) {
      res.render("500", {
        message: "Error! " + err.stack
      });
    }
  },
  /**
   * Add user
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async postAddUser(req, res) {
    // DB
    try {
      const username = req.body.username;
      const password = bcrypt.hashSync(req.body.password, 12);
      const citizen_id = req.body.citizen_id;
      const name = req.body.name;
      const address = req.body.address;
      const email = req.body.email;
      const phone_number = req.body.phone_number;
      const sql =
        "CALL insert_user(:username, :password, :citizen_id, :name, :address, :email, :phone_number);";
      await db.query(sql, {
        replacements: {
          username,
          password,
          citizen_id,
          name,
          address,
          email,
          phone_number
        },
        type: QueryTypes.RAW
      });
      req.flash("message", { type: "success", text: "New user added!" });
      res.redirect("/users");
    } catch (err) {
      res.render("500", {
        message: "Error while creating a new user! " + err.stack
      });
    }
  },
  /**
   * Delete user
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async postDeleteUser(req, res) {
    try {
      const sql = "CALL delete_user(:user_id);";
      await db.query(sql, {
        replacements: { user_id: req.body.user_id },
        type: QueryTypes.RAW
      });
      req.flash("message", { type: "success", text: "User deleted!" });
      res.redirect("/users");
    } catch (err) {
      res.render("500", {
        message: "Error while deleting a user! " + err.stack
      });
    }
  },

  /**
   * Edit user password
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async postEditPassword(req, res) {
    try {
      const password = bcrypt.hashSync(req.body.password, 12);
      const sql =
        "UPDATE authenticable_user SET password = :password WHERE user_id = :user_id;";
      await db.query(sql, {
        replacements: { user_id: req.body.user_id, password: password },
        type: QueryTypes.UPDATE
      });
      req.flash("message", {
        type: "success",
        text: "Password has been updated!"
      });
      res.redirect("/users");
    } catch (err) {
      res.render("500", {
        message: "Error while deleting a user! " + err.stack
      });
    }
  },
  /**
   * Mirrror to mongodb
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async postMirrorToMongoDB(req, res) {
    // DB
    try {
      const docs = await controller.findAllUsers();
      console.log(docs);
      await User.deleteMany({});
      await User.insertMany(docs);
      req.flash("message", {
        type: "success",
        text: "User database has been mirrored to the MongoDB server!"
      });
      res.redirect("/users");
    } catch (err) {
      res.render("500", {
        message:
          "Error while mirroring data to the MongoDB server! " + err.stack
      });
    }
  }
};

module.exports = controller;
