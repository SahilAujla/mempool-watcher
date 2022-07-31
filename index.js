const { ethers, utils } =   require('ethers');
require("dotenv").config({ path: ".env" });
var url = process.env.QUICKNODE_WSS_URL;
var ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

var provider = new ethers.providers.AlchemyProvider("rinkeby", ALCHEMY_API_KEY);

var init = function () {
  var customWsProvider = new ethers.providers.WebSocketProvider(url);

  customWsProvider.on("pending", (tx) => {
    customWsProvider.getTransaction(tx).then(function (transaction) {
      if (transaction.to === "0x0B53E89cFD388f54A3683AAfc5974db4593B6641" && Number(utils.formatEther(transaction.value)) > 0) {
        console.log(`0x0B53E89cFD388f54A3683AAfc5974db4593B6641 will receive ${utils.formatEther(transaction.value)} ether: Transaction pending 🚨`);
        const txnCheck = async (txnHash) => {
          let txn_receipt = await provider.getTransaction(txnHash);
          if (txn_receipt) {
            if (txn_receipt.blockNumber) {
              // console.log(`txn done: ${txn_receipt}`);
              console.log(`0x0B53E89cFD388f54A3683AAfc5974db4593B6641 received ${utils.formatEther(txn_receipt.value)} ether ✅`);
              clearInterval(interval);
              return txn_receipt
            }
          }
        }
        let interval = setInterval(async() => await txnCheck(transaction.hash), 5000);
      }
    });
  });

  customWsProvider._websocket.on("error", async () => {
    console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
    setTimeout(init, 3000);
  });
  customWsProvider._websocket.on("close", async (code) => {
    console.log(
      `Connection lost with code ${code}! Attempting reconnect in 3s...`
    );
    customWsProvider._websocket.terminate();
    setTimeout(init, 3000);
  });
};

init();
