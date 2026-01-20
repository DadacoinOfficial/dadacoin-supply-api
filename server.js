import express from "express";
import { ethers } from "ethers";

const app = express();

const RPC_URL = "https://bsc-dataseed.binance.org/";
const CONTRACT_ADDRESS = "0x688A09C98b3469EAAb48a2bEE1c48b9d133e6567";
const DECIMALS = 18;

// burn + wallets non-circulants
const EXCLUDED_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dEaD",
];

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const token = new ethers.Contract(CONTRACT_ADDRESS, ERC20_ABI, provider);

function toTokenUnits(bn) {
  return ethers.formatUnits(bn, DECIMALS).split(".")[0];
}

async function sumBalances(addresses) {
  let total = 0n;
  for (const addr of addresses) {
    total += await token.balanceOf(addr);
  }
  return total;
}

app.get("/total-supply", async (_req, res) => {
  try {
    const ts = await token.totalSupply();
    res.set("Content-Type", "text/plain").send(toTokenUnits(ts));
  } catch {
    res.status(500).set("Content-Type", "text/plain").send("0");
  }
});

app.get("/circulating-supply", async (_req, res) => {
  try {
    const ts = await token.totalSupply();
    const excluded = await sumBalances(EXCLUDED_ADDRESSES);
    const circulating = ts - excluded;
    res.set("Content-Type", "text/plain").send(toTokenUnits(circulating));
  } catch {
    res.status(500).set("Content-Type", "text/plain").send("0");
  }
});

app.listen(3000, () => {
  console.log("DADACOIN API running on http://localhost:3000");
});
