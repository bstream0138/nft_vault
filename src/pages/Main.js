import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI css
import { Box, TextField, Typography, Button } from "@mui/material";

// recoil
import { useSetRecoilState } from "recoil";
import { loadingState } from "../recoil/loading.js";
import { addressState } from "../recoil/account.js";

// caver
import { MnemocinToAccount, privateKeyToAccount } from "../utils/caver.js";

export default function Main() {
  const setLoading = useSetRecoilState(loadingState);
  const [isErr, setIsErr] = useState(false);
  const setAddress = useSetRecoilState(addressState);
  const [inputKey, setInputKey] = useState("");
  const [inputCode, setInputCode] = useState("");
  const navigate = useNavigate();

  const handleGetAddress = async () => {
    setLoading({ isLoading: true });
    const addressByKey = await privateKeyToAccount(inputKey);
    const addressByMnemonic = await MnemocinToAccount(inputCode);

    if (addressByKey || addressByMnemonic) {
      if (addressByKey) {
        setAddress({
          address: addressByKey,
          privateKey: inputKey,
        });
      } else if (addressByMnemonic) {
        setAddress({
          address: addressByMnemonic.address,
          privateKey: addressByMnemonic.address,
        });
      }
      navigate("/NFT");
      setIsErr(false);
      setLoading({ isLoading: false });
    } else {
      setIsErr(true);
      setLoading({ isLoading: false });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: "3%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", mt: "5%" }}>
        <Typography> &lt; PrivateKey or Mnemonic &gt; </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          mt: "5%",
        }}
      >
        <Box sx={{ width: "70%" }}>
          {!isErr ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                id="addressInput"
                label="PrivateKey로 접속할 수 있습니다."
                variant="standard"
                fullWidth
                onChange={(e) => setInputKey(e.target.value)}
              />
              <TextField
                autoFocus
                margin="dense"
                id="codeInput"
                label="Mnemonic으로 접속할 수 있습니다."
                variant="standard"
                fullWidth
                onChange={(e) => setInputCode(e.target.value)}
                sx={{ mt: "5%" }}
              />
            </>
          ) : (
            <>
              <TextField
                error
                id="standard-error-helper-text"
                label="PrivateKey가 올바르지 않습니다."
                fullWidth
                helperText="유효한 PrivateKey 인지 확인해주세요."
                variant="standard"
                onChange={(e) => setInputKey(e.target.value)}
              />
              <TextField
                error
                margin="dense"
                id="codeInput"
                label="Mnemonic 값이 올바르지 않습니다."
                helperText="유효한 Mnemonic 값 인지 확인해주세요."
                variant="standard"
                fullWidth
                onChange={(e) => setInputCode(e.target.value)}
                sx={{ mt: "5%" }}
              />
            </>
          )}
        </Box>
      </Box>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Button
          sx={{ width: "40%", mt: "5%" }}
          onClick={handleGetAddress}
          variant="contained"
        >
          접속하기
        </Button>
      </Box>
    </Box>
  );
}
