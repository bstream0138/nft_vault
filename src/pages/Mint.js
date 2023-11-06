import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI css
import { 
  Box,
  Typography,
  TextField,
  Button
 } from "@mui/material";

// api
import { jsonToPinata } from "../APIs/pinataCall.js";

// component
// import BeforeMint from "../components/BeforeMint.js";
// import MintButton from "../components/MintButton.js";


// recoil
import { useRecoilValue,useSetRecoilState,useResetRecoilState, } from "recoil";
import { nftMetaState } from "../recoil/nftMeta.js"
//import { imageState } from "../recoil/image.js";
//import { fileNumState } from "../recoil/files.js";
import { addressState } from "../recoil/account.js";
import { loadingState } from "../recoil/loading.js";
import { guideState } from "../recoil/guide.js";
import { successState } from "../recoil/success.js";
import { fileNumState } from "../recoil/files.js";

// caver
import { minting, sendSignTx } from "../utils/caver.js";

export default function Mint() {
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const setNftMeta = useSetRecoilState(nftMetaState);

  const toAddress = useRecoilValue(addressState);
  const isLoading = useSetRecoilState(loadingState);
  const setGuide = useSetRecoilState(guideState);
  const setSuccess = useSetRecoilState(successState);
  const navigate = useNavigate();

  // state reset
  const resetNftMeta = useResetRecoilState(nftMetaState);
  const resetGuide = useResetRecoilState(guideState);
  const resetFileState = useResetRecoilState(fileNumState);

  const reset = () => {
    resetNftMeta();
    resetGuide();
  };

  const successReset = () => {
    resetFileState();
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = () => {
    setNftMeta({name, description});
  };

  const handleMinting = async () => {
    isLoading({ isLoading: true });

    const tokenURI = await jsonToPinata({name, description}); // Modify this line to pass name and description
    console.log("tokenUri : ", tokenURI);

    if (tokenURI) {
      setGuide({ message: "민팅을 시작합니다." });
      const result = await minting(tokenURI, toAddress.address);

      if (result.hash) {
        setGuide({ message: "블록체인에 NFT를 기록합니다." });
        setGuide({
          message: "사용자의 지갑으로 NFT를 전송합니다.",
        });
        sendSignTx(result.tx);
        setGuide({
          message: "전송이 완료되었습니다. Klip에서 확인해주세요.",
        });
        setSuccess({ isSuccess: true });
        setIsPopupOpen(true);
        successReset();
        isLoading({ isLoading: false });
      } else {
        isLoading({ isLoading: false });
        reset();
      }
    } else {
      isLoading({ isLoading: false });
      reset();
    }
  };

  /*
  const closePopup = () => {
    setIsPopupOpen(false);
  };
  */

  const navigateToNFTs = () => {
    navigate("/NFT");
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: "3%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" component="div" sx={{ mb: "3%", textAlign: "center" }}>
            수료증을 민팅할 준비가 되었습니다.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: "3%" }}>
            <img
              src="/ict_certificate.png"
              alt="Seoul ICT IS Certification"
              style={{ width: "50%", height: "auto" }}
            />
          </Box>
          <Typography variant="h5" component="div" sx={{ mb: "3%", textAlign: "center" }}>
            아래의 정보로 NFT가 민팅됩니다.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: "1%" }}>
            <Box sx={{ width: "50%" }}>
              <TextField
                autoFocus
                margin="dense"
                id="nameInput"
                label="name : NFT 이름을 쓰세요."
                variant="standard"
                fullWidth
                value={name}
                onChange={handleNameChange}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: "1%" }}>
            <Box sx={{ width: "50%" }}>
              <TextField
                margin="dense"
                id="descriptionInput"
                label="description : NFT에 관한 설명을 쓰세요."
                variant="standard"
                fullWidth
                value={description}
                onChange={handleDescriptionChange}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: "3%" }}>
            <Button onClick={handleMinting} variant="contained">
              민팅하기
            </Button>
          </Box>
        </Box>
      </Box>
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>NFT 수료증이 성공적으로 발급되었습니다.</h2>
            <button onClick={navigateToNFTs}>확인</button>
          </div>
        </div>
      )}
    </>
  );
}
