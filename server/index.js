const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;

app.use(cors());
app.use(express.json());

const balances = {
  "029edc9ff4f69a735141932932b62d637bbacafbaf3ca12018350eba1011fafc28": 100,
  "037190c00507360134dcbc44e1c367bcb0a48017c832d8f9b2cdc92a5e1c43170e": 50,
  "03b2b5c51f2c3c04fa5012a5fdaa95923fe92a5535d883d69b4a6717aadf518cb6": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;
  const senderHash = keccak256(Uint8Array.from(sender));
  const isSigned = secp256k1.verify(hexSign, senderHash, sender);
  console.log("Is signed: ", isSigned);
  if (isSigned){
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
  else {
    res.status(400).send({ message: "Not signed!" });
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
