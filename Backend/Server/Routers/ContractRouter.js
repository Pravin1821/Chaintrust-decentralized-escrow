const express = require('express');
const router = express.Router();
const {protect} = require('../Middleware/AuthMiddleware');
const {authorizeRoles} = require('../Middleware/RoleMiddleware');
const contractController = require('../Controller/ContractController');

router.post('/createContract', protect, authorizeRoles('client'), contractController.createContract);
router.get('/getContracts', protect, authorizeRoles('client'), contractController.getContractById);

module.exports = router;