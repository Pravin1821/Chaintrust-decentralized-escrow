const Report = require("../Model/Report");
const Contract = require("../Model/Contract");
const User = require("../Model/User");

function assert(condition, message, status = 400) {
  if (!condition) {
    const err = new Error(message || "Invalid request");
    err.status = status;
    throw err;
  }
}

function normalizeReason(reason) {
  return typeof reason === "string" ? reason.trim() : "";
}

exports.createReport = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { contractId, reportedUserId, reason } = req.body;
    const trimmedReason = normalizeReason(reason);

    assert(contractId, "contractId is required");
    assert(reportedUserId, "reportedUserId is required");
    assert(trimmedReason.length >= 20, "Reason must be at least 20 characters");

    const contract = await Contract.findById(contractId);
    assert(contract, "Contract not found", 404);

    const isClient = contract.client?.toString() === reporterId.toString();
    const isFreelancer =
      contract.freelancer?.toString() === reporterId.toString();
    assert(
      isClient || isFreelancer,
      "You can only report users on your contracts",
      403,
    );

    const otherUserId = isClient ? contract.freelancer : contract.client;
    assert(otherUserId, "No counterparty on this contract yet", 400);
    assert(
      otherUserId.toString() === reportedUserId,
      "Reported user must be the counterparty",
      400,
    );

    const existing = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      contract: contractId,
      status: { $in: ["Pending", "Reviewed"] },
    });
    assert(!existing, "You already reported this user for this contract");

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      contract: contractId,
      reason: trimmedReason,
    });

    await User.findByIdAndUpdate(reportedUserId, {
      $inc: { reportsCount: 1 },
    }).catch(() => {});

    res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    console.error("[ReportController] createReport", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to submit report" });
  }
};

exports.listReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ["Pending", "Reviewed", "Dismissed"].includes(status)) {
      query.status = status;
    }
    const reports = await Report.find(query)
      .populate("reporter", "username email reputation")
      .populate("reportedUser", "username email reputation isSuspended")
      .populate("contract", "title status amount");
    res.status(200).json(reports);
  } catch (error) {
    console.error("[ReportController] listReports", error);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    assert(
      ["Pending", "Reviewed", "Dismissed"].includes(status),
      "Invalid status",
    );
    const report = await Report.findByIdAndUpdate(id, { status }, { new: true })
      .populate("reporter", "username email")
      .populate("reportedUser", "username email")
      .populate("contract", "title");
    assert(report, "Report not found", 404);
    res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("[ReportController] updateStatus", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to update report" });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params; // report id
    const { userId } = req.body; // target user
    assert(userId, "userId is required");
    const report = await Report.findById(id);
    assert(report, "Report not found", 404);

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true },
    );
    assert(user, "User not found", 404);
    res.status(200).json({ message: "User suspended", user });
  } catch (error) {
    console.error("[ReportController] suspendUser", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to suspend user" });
  }
};
