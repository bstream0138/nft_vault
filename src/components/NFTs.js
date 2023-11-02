// react 캘린더 라이브러리 import
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import "./NFTs.css";

import React, { useEffect, useState } from "react";

// MUI css
import {
  Box,
  CardContent,
  Card,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";

// Recoil
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressState } from "../recoil/account.js";
import { loadingState } from "../recoil/loading.js";

// Api
import { getNftsByAddress } from "../APIs/kasCall.js";

export default function NFTs() {
  const { address } = useRecoilValue(addressState);
  const [nfts, setNfts] = useState([]);
  const [isCardExpanded, setIsCardExpanded] = useState([]);
  const isLoading = useSetRecoilState(loadingState);

  // 캘린더뷰의 시작일자는 수업 시작일자인 10월 18일로
  // 10월 18일 시작하려면 9월 18일로 셋팅
  const [activeStartDate, setActiveStartDate] = useState(new Date(2023, 9, 10));

  // NFT를 날짜별로 정리
  const [calendarNfts, setCalendarNfts] = useState({});

  const getNfts = async () => {
    isLoading({ isLoading: true });
    const nfts = await getNftsByAddress(address);
    setNfts(nfts);

    setIsCardExpanded(new Array(nfts.length).fill(false));
    isLoading({ isLoading: false });
  };

  const toggleCardExpansion = (index) => {
    setIsCardExpanded((prevState) =>
      prevState.map((value, i) => (i === index ? !value : value))
    );
  };

  const handleAddress = (address) => {
    window.open(
      `https://baobab.klaytnscope.com/account/${address}?tabId=txList`
    );
  };

  const handleTx = (tx) => {
    window.open(`https://baobab.klaytnscope.com/tx/${tx}?tabId=nftTransfer`);
  };


  // NFT 데이터를 날짜별로 가공하는 함수를 추가합니다.
  const processNFTsForCalendar = (nfts) => {
    const nftByDate = {};


    console.log(`nfts: ${nfts.length}`);
    
    nfts.forEach((nft) => {
      const createdAt = new Date(nft.createdAt).toISOString().split('T')[0]
      console.log(`nft's createdAt: ${createdAt}`);

      // createdAt에 해당하는 날짜가 없다면 배열 생성
      if (!nftByDate[createdAt]) {
        nftByDate[createdAt] = [];
      }

      nftByDate[createdAt].push(nft);
    });

    // 키 개수 확인
    console.log(`nftByDate: ${Object.keys(nftByDate).length}`);

    return nftByDate;
  };

  useEffect(() => {
    getNfts();    
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // 날짜별로 정리하고, 동일 날짜 NFT는 생성시간 가장 빠른 것만
    const processedNfts = processNFTsForCalendar(nfts);
    setCalendarNfts(processedNfts);
  }, [nfts]);

  // 캘린더에서 날짜가 변경될 때
  const onActiveStartDateChange = ({ activeStartDate, value, view }) => {
    setActiveStartDate(activeStartDate);
  };

  // 캘린더에서 날짜를 클릭했을 때
  const onDayClick = (value, event) => {
    const dateKey = value.toISOString().split('T')[0];
    const nft = nfts.find((nft) => new Date(nft.createdAt).toDateString() === dateKey);
    if(nft) {
      // 상세 정보를 표시하는 로직을 구현한다.
      // 예를 들어, 모달을 열어 상세 정보를 보여주는 것 등...
    }
  };

  // 캘린더 타일을 렌더링하는 함수
  const renderCalendarTile = ({ date, view }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayNfts = calendarNfts[dateKey] || [];

    // 해당 날짜와 dayNfts.length를 콘솔에 출력
    //console.log(`Date: ${dateKey}, NFT Count: ${dayNfts.length}`);
    // 해당 날짜와 dayNfts.length를 콘솔에 출력
    console.log(`Date: ${dateKey}, NFT Count: ${dayNfts.length}`);


    if (dayNfts.length > 0 ){
      // 해당 날짜에 NFT가 있다면 첫번째 NFT만 사용
      const nft = dayNfts[0];

      return (
        <div>
          <div key={nft.id}>
            <img
                  src={nft.image}
                  alt={nft.name}
                  style={{ width: "100px" }}
                  onClick={() => {
                    // 이미지를 클릭했을 때 상세 정보를 표시하는 로직을 구현
                    alert(`NFT Name: ${nft.name}\nDescription: ${nft.description}`);
                  }}
                />
          </div>
        </div>
      )
    }
    // 해당 날짜에 NFT가 없으면 
    return null;
  };

  const rendering = () => {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {nfts.map((nft, index) => (
          <Box
            key={index}
            sx={{
              margin: "2%",
              flex: "0 0 calc(33.33% - 16px)",
            }}
          >
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography variant="h5">{nft.name}</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>Owned by</Typography>
                  <Typography
                    variant="h10"
                    color="blue"
                    sx={{ cursor: "pointer", ml: "4px" }}
                    onClick={() => handleAddress(address)}
                  >
                    {address.slice(0, 6)}...
                    {address.slice(address.length - 5, address.length - 1)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: "15px",
                  }}
                >
                  <img
                    src={nft.image}
                    alt={nft.name}
                    style={{ width: "150px" }}
                  />
                </Box>
                <Typography variant="h8" sx={{ mt: "3px" }}>
                  {nft.description}
                </Typography>
                {nft.attributes && nft.attributes.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {nft.attributes.map((attribute, attrIndex) => (
                      <Box
                        key={attrIndex}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          margin: "10px",
                        }}
                      >
                        <Card
                          sx={{
                            minWidth: 60,
                            backgroundColor: "#F1F1F1",
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="h10" fontSize="small">
                                {attribute.trait_type}
                              </Typography>
                              <Typography
                                variant="h10"
                                fontSize="small"
                                sx={{ mt: "3px" }}
                              >
                                {attribute.value}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                ) : null}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isCardExpanded[index]}
                        onChange={() => toggleCardExpansion(index)}
                        color="primary"
                      />
                    }
                    label="Details"
                  />
                  {isCardExpanded[index] && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "wrap",
                        p: 2,
                      }}
                    >
                      <Box sx={{ display: "flex" }}>
                        <Typography fontSize="small">
                          Contract Address :
                        </Typography>
                        <Typography
                          variant="h10"
                          color="blue"
                          fontSize="small"
                          sx={{ cursor: "pointer", ml: "4px" }}
                          onClick={() => handleAddress(nft.contractAddress)}
                        >
                          {nft.contractAddress.slice(0, 6)}...
                          {nft.contractAddress.slice(
                            nft.contractAddress.length - 5,
                            nft.contractAddress.length - 1
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "10px", display: "flex" }}>
                        <Typography fontSize="small">Token ID : </Typography>
                        <Typography fontSize="small" sx={{ ml: "4px" }}>
                          {nft.tokenId}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "10px", display: "flex" }}>
                        <Typography fontSize="small">Chain : </Typography>
                        <Typography fontSize="small" sx={{ ml: "4px" }}>
                          {nft.chain}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "10px", display: "flex" }}>
                        <Typography fontSize="small">
                          Last Updated :{" "}
                        </Typography>
                        <Typography fontSize="small" sx={{ ml: "4px" }}>
                          {nft.createdAt}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "10px", display: "flex" }}>
                        <Typography fontSize="small">Transaction : </Typography>
                        <Typography
                          variant="h10"
                          color="blue"
                          fontSize="small"
                          sx={{ cursor: "pointer", ml: "4px" }}
                          onClick={() => handleTx(nft.transactionHash)}
                        >
                          {nft.transactionHash.slice(0, 6)}...
                          {nft.transactionHash.slice(
                            nft.transactionHash.length - 5,
                            nft.transactionHash.length - 1
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  };

  

  return (
    <Box className="calendar-container">
      <Calendar
        onChange={onDayClick}
        value={activeStartDate}
        onActiveStartDateChange={onActiveStartDateChange}
        onClickDay={onDayClick}
        tileContent={renderCalendarTile}
        view="month"
        calendarType="US"
      />
      
    </Box>
  );

}