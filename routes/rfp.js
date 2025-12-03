let express = require("express")
let router = express.Router()

router.get("/health", (req, res) => {
	res.json({status: "ok"})
})

module.exports = router
