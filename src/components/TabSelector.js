import React from "react";
import { useNavigate } from "react-router-dom";

// recoil
import { useRecoilState, useResetRecoilState } from "recoil";
import { tabSelectState } from "../recoil/tabSelect.js";
import { securityState } from "../recoil/security.js";

// MUI css
import { Box, Tabs, Tab } from "@mui/material";

export default function TabSelector() {
  const [tabValueState, setTabValue] = useRecoilState(tabSelectState);
  const resetSecurity = useResetRecoilState(securityState);
  const navigate = useNavigate();

  const handleTab = (event, newValue) => {
    setTabValue({ tabSelect: newValue });

    navigate(`/${newValue}`);
    resetSecurity();
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        onChange={handleTab}
        value={tabValueState.tabSelect}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab label="NFT 출석부" value="NFT" />
      </Tabs>
    </Box>
  );
}
