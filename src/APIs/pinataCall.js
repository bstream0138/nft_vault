import axios from "axios";
import {
  REACT_APP_ACCESS_KEY,
  REACT_APP_SECRET_ACCESS_KEY,
} from "../utils/config.js";

axios.defaults.withCredentials = true;

export const uploadImgToPinata = async (data) => {
  try {
    const res = await axios
      .post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: `${REACT_APP_ACCESS_KEY}`,
          pinata_secret_api_key: `${REACT_APP_SECRET_ACCESS_KEY}`,
        },
      })
      .then((res) => {
        return `ipfs://${res.data.IpfsHash}`;
      })
      .catch((err) => {
        console.log(err);
      });

    return res;
  } catch (err) {
    console.error(err);
  }
};

export const jsonToPinata = async (metaData) => {
  try {
    const baseUrl = "https://gateway.pinata.cloud/ipfs/";
    const data = JSON.stringify({
      pinataMetadata: {
        name: metaData.name,
      },
      pinataContent: metaData,
    });

    const res = await axios
      .post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: `${REACT_APP_ACCESS_KEY}`,
          pinata_secret_api_key: `${REACT_APP_SECRET_ACCESS_KEY}`,
        },
      })
      .then((res) => {
        const result = `${baseUrl}${res.data.IpfsHash}`;
        return result;
      });

    return res;
  } catch (err) {
    console.error(err);
  }
};
