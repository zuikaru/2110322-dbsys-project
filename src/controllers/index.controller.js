module.exports = {
  /**
   * Get index page
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async getIndex(req, res) {
    //res.send(`IP: ${req.ip}`);
    res.render("home", { ip: req.ip, title: "Home" });
  }
};
