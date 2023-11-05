import axios from "axios";

import {
  REACT_APP_KAS_ACCESS_KEY,
  REACT_APP_KAS_SECRET_KEY,
} from "../utils/config.js";

import { hexToNum } from "../utils/caver.js";

axios.defaults.withCredentials = true;

// EOA로 NFTs 가져오기
export const getNftsByAddress = async (address) => {

  // address 갱신 잘되는지 확인
  console.log(`current address is ${address}`);

  const result = [];
  try {
    const options = {
      auth: {
        username: REACT_APP_KAS_ACCESS_KEY,
        password: REACT_APP_KAS_SECRET_KEY,
      },
      headers: {
        "Content-Type": `application/json`,
        "x-chain-id": "1001",
      },
    };
    const url = `https://th-api.klaytnapi.com/v2/account/${address}/token`;
    const nftsByKas = await axios.get(url, options).then((res) => {
      return res.data.items;
    });

    for (let i = 0; i < nftsByKas.length; i++) {
      if (nftsByKas[i].kind !== "nft") {
        continue;
      } else {
        const nftInfo = {};

        nftInfo.contractAddress = nftsByKas[i].contractAddress;
        nftInfo.tokenId = await hexToNum(nftsByKas[i].extras.tokenId);
        nftInfo.createdAt = timeStamp(nftsByKas[i].updatedAt);
        nftInfo.chain = "Klaytn Baobab";
        nftInfo.transactionHash = nftsByKas[i].lastTransfer.transactionHash;

        const metaData = await getMetadata(nftsByKas[i].extras.tokenUri);
        nftInfo.name = metaData.name;
        nftInfo.description = metaData.description;

        if (metaData.image) {
          if (metaData.image.slice(0, 4) === "ipfs") {
          
            const ipfsHash = metaData.image.slice(7);
            const checkUri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            nftInfo.image = checkUri;
          } else {
            nftInfo.image = metaData.image;
          }
        } else {  // Corrupt Image 예외처리
          nftInfo.image = "/nft_error.png";
        }

        if (metaData.attributes) {
          nftInfo.attributes = metaData.attributes;
        }

        result.push(nftInfo);
      }
    }
    return result;
  } catch (e) {
    console.log(e);
    return result;
  }
};

// timeStamp 계산
const timeStamp = (input) => {
  const milliseconds = input * 1000;
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
};

// Metadata 가져오기
const getMetadata = async (uri) => {
  try {
    const data = await fetch(uri)
      .then((response) => {
        if (!response.ok) {
          throw new Error("네트워크 오류 또는 HTTP 오류");
        }
        return response.json();
      })
      .then((data) => {
        return data;
      });
    return data;
  } catch (e) {
    console.log(e);
  }
};
