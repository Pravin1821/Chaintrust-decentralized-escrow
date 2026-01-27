const Contract = require('../Model/Contract');

exports.createContract = async (req, res) => {
    try {
        const { title, description, amount, deadline } = req.body;
        const newContract = new Contract({
            client: req.user._id,
            title,
            description,
            amount,
            deadline
        });
        await newContract.save();
        res.status(201).json({message: "Contract created successfully",newContract});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getContractById = async (req, res) => {
    try {
        const contracts = await Contract.find({'client': req.user._id})
                                        .sort({ createdAt: -1 });
        res.status(200).json(contracts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
