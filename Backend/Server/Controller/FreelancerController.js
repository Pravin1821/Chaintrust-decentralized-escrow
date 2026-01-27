const contract = require('../Model/Contract');

exports.getAssignedContracts = async (req, res) => {
    try {
        const contracts = await contract.find({'freelancer': req.user._id}) 
                                        .sort({ createdAt: -1 });
        res.status(200).json(contracts);
    }   
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};  
exports.updateContractStatus = async (req, res) => {
    try {
        const { contractId, status } = req.body;
        const validStatues = ["Created", "Assigned", "Funded", "Submitted", "Approved", "Paid", "Disputed", "Resolved"];
        if(!validStatues.includes(status)){
            return res.status(400).json({ message: 'Invalid status value'});
        }
        const existingContract = await contract.findOne({'_id': contractId, 'freelancer': req.user._id});
        if(!existingContract){
            return res.status(404).json({ message: "Contract not found"});
        }
        existingContract.status = status;
        existingContract.updatedAt = Date.now();
        await existingContract.save();
        res.status(200).json({ message: "Contract status updated successfully", existingContract});
    }   
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.submitWork = async (req, res) => {
    try{
        const { contractId, ipfsHash } = req.body;
        const existingContract = await contract.findOne({'_id': contractId, 'freelancer': req.user._id});
        if(!existingContract){
            return res.status(404).json({message: "Contract not found"});
        }
        existingContract.ipfsHash = ipfsHash;
        existingContract.status = "Submitted";
        existingContract.updatedAt = Date.now();
        await existingContract.save();
        res.status(200).json({ message: "Work submitted successfully", existingContract });
    }
    catch(error){
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getConntractById = async (req, res) => {
    try {
        const contractId = req.params.id;
        const existingContract = await contract.findOne({'_id': contractId, 'freelancer': req.user._id});
        if(!existingContract){
            return res.status(404).json({ message: "Contract not found"});
        }
        res.status(200).json(existingConttract);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
