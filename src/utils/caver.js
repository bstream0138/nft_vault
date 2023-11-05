import {
  REACT_APP_ADDRESS,
  REACT_APP_RPC_URL,
  REACT_APP_PRIVATE_KEY,
} from "./config.js";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";

// abi
import { AttendCA, AttendABI } from "../contract/getAbiData.js";

// caver
import Caver from "caver-js";
const caver = new Caver(REACT_APP_RPC_URL);

// contract
const AttendContract = new caver.klay.Contract(AttendABI, AttendCA);

// Address 확인
export const checkAddress = (address) => {
  return caver.utils.isAddress(address);
};

// 비밀키로 주소 가져오기
export const privateKeyToAccount = async (privateKey) => {
  let result;

  try {
    result = await caver.klay.accounts.privateKeyToAccount(privateKey).address;
  } catch (e) {
    result = false;
  }

  return result;
};

// 영어 or 한글 체크
const checkLanguage = (text) => {
  const isEng = /^[a-zA-Z ]*$/;

  if (isEng.test(text)) return "en";

  return "ko";
};

// 니모닉으로 주소 가져오기
export const MnemocinToAccount = async (mnemonic) => {
  const word = checkLanguage(mnemonic);
  let result;

  try {
    const walletMnemonic = ethers.Wallet.fromMnemonic(
      mnemonic,
      // undefined,
      `m/44'/60'/0'/0/0`,
      word
    );
    result = {
      address: walletMnemonic.address,
      privateKey: walletMnemonic.privateKey,
    };
  } catch (e) {
    result = false;
  }

  return result;
};

// NFT Minting
export const minting = async (tokenURI, to) => {
  const mint = AttendContract.methods.mintNFT(to, tokenURI).encodeABI();

  //console.log("tokenURI 정보 : ", tokenURI);
  //console.log("대상 지갑주소 정보 : ", to);

  const estimate = await AttendContract.methods
    .mintNFT(to, tokenURI)
    .estimateGas({
      from: REACT_APP_ADDRESS,
    });

  //console.log("예상 실행 가스비 견적 : ", estimate);
  const result = await SendTransactionNoValue(mint, AttendCA, estimate);
  //console.log("트랜잭션 해시 : ", result.hash);
  return result;
};

// Transaction for Data
export const SendTransactionNoValue = async (data, to, estimateGas) => {
  const privateKey = CryptoJS.AES.decrypt(
    REACT_APP_PRIVATE_KEY,
    REACT_APP_ADDRESS
  ).toString(CryptoJS.enc.Utf8);

  //console.log("NFT data : ", data);

  const signTx = await caver.klay.accounts
    .signTransaction(
      {
        from: REACT_APP_ADDRESS,
        to: to,
        gas: estimateGas,
        gasPrice: await caver.klay.getGasPrice(),
        data: data,
      },
      //privateKey
      REACT_APP_PRIVATE_KEY
    )
    .then((res) => res.rawTransaction);

  const txHash = caver.utils.soliditySha3(signTx);

  const result = {
    hash: txHash,
    tx: signTx,
  };

  return result;
};

// 사인된 트랜잭션을 전송
export const sendSignTx = async (signTx) =>
  await caver.klay.sendSignedTransaction(signTx).then((hash, err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("완료되었습니다.", hash);
    }
  });

export const test = async () => {
  await caver.klay.getGasPrice().then(console.log());
};

// 네트워크 상태
export const isListening = async () => {
  const peerCount = await caver.rpc.net.getPeerCount();
  return await caver.utils.hexToNumber(peerCount);
};

// 잔액 조회
export const getBalance = async (address) => {
  const balance = await caver.rpc.klay
    .getBalance(address)
    .then(async (data) => {
      const peb = await caver.utils.hexToNumberString(data);
      return caver.utils.convertFromPeb(Number(peb));
    });
  let floorBalance;
  let decimal;
  let sliceIndex = 0;
  const arrayBalance = balance.split("");

  for (let i = 0; i < arrayBalance.length; i++) {
    if (arrayBalance[i] === ".") {
      sliceIndex = i;
      break;
    }
  }

  decimal = balance.slice(sliceIndex + 1);

  if (decimal.length > 4) {
    floorBalance = Number(balance).toFixed(4);
    return floorBalance;
  }
  console.log(balance);
  return balance;
};

// Hex to Num
export const hexToNum = async (hex) => {
  return await caver.utils.hexToNumber(hex);
};
