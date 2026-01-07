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
  "0xd9C56a04Da8e13b1fdc5043638A6102aBC01117c",
  "0xd8C6055759341A0C5638e6a0f1beea879E4E94c6",
  "0x9b5F08da413bbCb80E7D0d73B1604E843f7E40E1",
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
