import React, { useEffect, useCallback, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";

// MUI css
import { Box, Typography } from "@mui/material";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Images
import headerMMG from "../img/codestates_Logo.png";

import { REACT_APP_RPC_URL } from "../utils/config.js";

// recoil
import { useResetRecoilState, useRecoilState, useRecoilValue } from "recoil";
import { nftMetaState } from "../recoil/nftMeta.js";
import { addressState } from "../recoil/account.js";
import { loadingState } from "../recoil/loading.js";
import { tabSelectState } from "../recoil/tabSelect.js";
import { networkState } from "../recoil/network.js";
import { securityState } from "../recoil/security.js";
import { guideState } from "../recoil/guide.js";
import { successState } from "../recoil/success.js";

// Util
import { isListening, getBalance } from "../utils/caver";

export default function Header() {
  // state reset
  const resetNftMeta = useResetRecoilState(nftMetaState);
  const resetAddress = useResetRecoilState(addressState);
  const resetTabSelect = useResetRecoilState(tabSelectState);
  const resetLoading = useResetRecoilState(loadingState);
  const resetSecurity = useResetRecoilState(securityState);
  const resetGuide = useResetRecoilState(guideState);
  const resetSuccess = useResetRecoilState(successState);

  const { address } = useRecoilValue(addressState);
  const [peer, setPeer] = useState(0);
  const [balance, setBalance] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const reset = () => {
    resetNftMeta();
    resetAddress();
    resetTabSelect();
    resetLoading();
    resetSecurity();
    resetGuide();
    resetSuccess();
    window.location.replace("/");
  };

  const [whichNet, setWhichNEt] = useRecoilState(networkState);

  const handleNetwork = useCallback(async () => {
    let network = REACT_APP_RPC_URL;
    network.toLowerCase();

    if (network.indexOf("polygon") !== -1 && network[8] === "p") {
      setWhichNEt({ network: "Polygon" });
    } else if (network.indexOf("main") !== -1 && network[8] === "m") {
      setWhichNEt({ network: "Ethereum" });
    } else if (network.indexOf("goerli") !== -1 && network[8] === "g") {
      setWhichNEt({ network: "Ethereum" });
    } else if (network.indexOf("matic") !== -1 && network[8] === "r") {
      setWhichNEt({ network: "Polygon" });
    } else if (network.indexOf("klaytn") !== -1) {
      setWhichNEt({ network: "Klaytn" });
    }
  }, [setWhichNEt]);

  const handleListening = async () => {
    const result = await isListening();
    setPeer(result);
  };

  const handleCopy = () => {
    enqueueSnackbar("주소를 복사합니다.");
  };

  const handleAddress = () => {
    window.open(
      `https://baobab.klaytnscope.com/account/${address}?tabId=txList`
    );
  };

  const handleBalance = useCallback(async () => {
    if (address.length > 0) {
      const result = await getBalance(address);
      setBalance(result);
    }
  }, [address]);

  useEffect(() => {
    handleNetwork();
    handleListening();
    handleBalance();
  }, [handleNetwork, handleBalance]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        m: "1%",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Box
          onClick={reset}
          sx={{ display: "flex", justifyContent: "center", cursor: "pointer", 
          mt: "20px" 
        }}
        >
          <img src={headerMMG} width="auto" height="40px" alt="logo" />
          <Typography variant="h4" ml="10px">
            ICT x Codestates 블록체인 과정 출석부
          </Typography>
        </Box>
        {/* 연결 지갑 주소, 잔고, 네트워크 상태 표시 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            mt: "30px",
            width: "100%",
          }}
        >
          {address.length === 0 ? null : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Typography
                  variant="h10"
                  color="blue"
                  sx={{ cursor: "pointer" }}
                  onClick={handleAddress}
                >
                  {address.slice(0, 6)}...
                  {address.slice(address.length - 5, address.length - 1)}
                </Typography>
                <CopyToClipboard text={address}>
                  <ContentCopyIcon
                    fontSize="small"
                    sx={{ ml: "7px", cursor: "pointer" }}
                    onClick={handleCopy}
                  />
                </CopyToClipboard>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Typography variant="h10">{balance} KLAY</Typography>
              </Box>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {peer > 0 ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    mr: "3px",
                  }}
                >
                  <NetworkCheckIcon fontSize="small" color="success" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    mr: "3px",
                  }}
                >
                  <Typography variant="h10">
                    {whichNet.network} Baobab is healthy
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    mr: "3px",
                  }}
                >
                  <NetworkCheckIcon fontSize="small" color="disabled" />
                </Box>
                <Typography variant="h10">네트워크가 불안정합니다.</Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
