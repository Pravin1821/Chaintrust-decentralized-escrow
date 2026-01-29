const express = require('express');
const router = express.Router();
const {protect} = require('../Middleware/AuthMiddleware');
const {authorizeRoles} = require('../Middleware/RoleMiddleware');
const contractController = require('../Controller/ContractController');
const {enforceContractState} = require('../Middleware/ContractStateMiddleware');
router.post('/createContract', protect, authorizeRoles('client'), contractController.createContract);
router.get('/getContracts', protect, authorizeRoles('client'), contractController.getContractById);
router.post('/assignFreelancer/:id', protect, authorizeRoles('client'), contractController.assignFreelancer);
router.post('/fundContract/:id', protect, authorizeRoles('client'),   enforceContractState("Assigned"),contractController.fundContract);
router.post('/approveWork/:id', protect, authorizeRoles('client'), enforceContractState("Submitted"), contractController.approveWork);


module.exports = router;