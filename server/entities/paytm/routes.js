import express from "express";
import {
  initiateTransaction,
  updateTransaction,
  getSavedCard,
  fetchPaymentOptions,
  fetchPcfDetails,
  fetchBinDetail,
  sendOtp,
  validateOtp,
  fetchBalanceInfo,
  fetchNBPaymentChannels,
  fetchEMIDetail,
  validateVpa,
  processTransaction,
} from "./controllers";

const router = express.Router();

router.route("/initiateTransaction").post(initiateTransaction);
router.route("/updateTransaction").post(updateTransaction);
router.route("/fetchPaymentOptions").post(fetchPaymentOptions);
router.route("/getSavedCard").post(getSavedCard);
router.route("/fetchPcfDetails").post(fetchPcfDetails);
router.route("/fetchBinDetail").post(fetchBinDetail);
router.route("/sendOtp").post(sendOtp);
router.route("/validateOtp").post(validateOtp);
router.route("/fetchBalanceInfo").post(fetchBalanceInfo);
router.route("/fetchNBPaymentChannels").post(fetchNBPaymentChannels);
router.route("/fetchEMIDetail").post(fetchEMIDetail);
router.route("/validateVpa").post(validateVpa);
router.route("/processTransaction").post(processTransaction);

export default router;
