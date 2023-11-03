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
  Button,
  TextField,
} from "@mui/material";

// Recoil
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressState } from "../recoil/account.js";
import { loadingState } from "../recoil/loading.js";

// Api
import { getNftsByAddress } from "../APIs/kasCall.js";

// Modal
import Modal from "@mui/material/Modal";

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

  // Modal 관련 변수
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // 현재 페이지에서 사용할 address 변수 선언
  const [local_address, setLocalAddress] = useState(address);
  // 주소입력박스
  const [inputAddress, setInputAddress] = useState(address);

  const getNfts = async () => {
    isLoading({ isLoading: true });

    const nfts = await getNftsByAddress(local_address);
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

  
  // local address로 NFT 갱신
  const handleUpdateAddress = async () => {
    setLocalAddress(inputAddress);
    const updateNfts = await getNftsByAddress(inputAddress);
    setNfts(updateNfts);
    setIsCardExpanded(new Array(updateNfts.length).fill(false));
  }

  const handleTx = (tx) => {
    window.open(`https://baobab.klaytnscope.com/tx/${tx}?tabId=nftTransfer`);
  };

  // 주소 업데이트 관련 
  const handleInputChange = (event) => {
    setInputAddress(event.target.value);
  };

  // 주소 업데이트 관련
  const updateAddress = () => {
    setLocalAddress(inputAddress);
  };


  // NFT 데이터를 날짜별로 가공하는 함수를 추가합니다.
  const processNFTsForCalendar = (nfts) => {
    const nftByDate = {};


    console.log(`nfts: ${nfts.length}`);
    
    nfts.forEach((nft) => {
      const createdAt = new Date(nft.createdAt).toISOString().split('T')[0]
      //console.log(`nft's createdAt: ${createdAt}`);

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


  // 모달 Open & Close
  const openModal = (nft) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedNFT(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    getNfts();    
    // eslint-disable-next-line
  }, []);

  // 날짜별로 정리하고, 동일 날짜 NFT는 생성시간 가장 빠른 것만
  useEffect(() => {
    const processedNfts = processNFTsForCalendar(nfts);
    setCalendarNfts(processedNfts);
  }, [nfts]);

  // local_address가 변경될 때마다 NFT 목록을 다시 가져오도록 함
  useEffect(() => {
    const getNftsByLocalAddress = async () => {
      isLoading({ isLoading: true });
      const nfts = await getNftsByAddress(local_address);
      setNfts(nfts);
      setIsCardExpanded(new Array(nfts.length).fill(false));
      isLoading({ isLoading: false });
    };

    getNftsByLocalAddress();
  }, [local_address]);

  // 캘린더에서 날짜가 변경될 때
  const onActiveStartDateChange = ({ activeStartDate, value, view }) => {
    setActiveStartDate(activeStartDate);
  };

  // 캘린더에서 날짜를 클릭했을 때
  const onDayClick = (value, event) => {
    const dateKey = value.toISOString().split('T')[0];
    const nft = nfts.find((nft) => new Date(nft.createdAt).toDateString() === dateKey);
    if(nft) {
      openModal(nft);
    }
  };

  // 캘린더 타일을 렌더링하는 함수
  const renderCalendarTile = ({ date, view }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayNfts = calendarNfts[dateKey] || [];

    // 해당 날짜와 dayNfts.length를 콘솔에 출력
    // console.log(`Date: ${dateKey}, NFT Count: ${dayNfts.length}`);
    // 해당 날짜와 dayNfts.length를 콘솔에 출력
    // console.log(`Date: ${dateKey}, NFT Count: ${dayNfts.length}`);


    if (dayNfts.length > 0 ){
      // 해당 날짜에 NFT가 있다면 첫번째 NFT만 사용
      const nft = dayNfts[0];

      return (
        <div className="calendar-tile">
          <div className="image-tile" key={nft.id} onClick={() => openModal(nft)}>
            <img
                  src={nft.image}
                  alt={nft.name}
                  style={{ width: "80px", cursor: "pointer" }}
                />
          </div>
        </div>
      )
    }
    // 해당 날짜에 NFT가 없으면 
    return (
      <div className="calendar-tile">
      </div>
    );
  };

  return (
    <Box className="calendar-container">
      <TextField
        label="주소 입력" 
        variant="outlined"
        value={inputAddress}
        onChange={handleInputChange}
        style={{marginBottom:"20px"}}
      />

      <Button 
        variant="contained"
        color="primary"
        onClick={handleUpdateAddress}
        style={{marginBottim: "20px"}}
      > 
        해당 주소의 NFT 불러오기 
      </Button>
      <p></p>
      <div className="calendar-message">
        해당 일자의 출석도장을 클릭하면 상세 내용을 확인하실 수 있습니다.
      </div>
      <Calendar
        className="calendar-container"
        onChange={onDayClick}
        value={activeStartDate}
        onActiveStartDateChange={onActiveStartDateChange}
        onClickDay={onDayClick}
        tileContent={renderCalendarTile}
        view="month"
        calendarType="US"
        next2Label={null} 
        prev2Label={null}
        nextLabel="▶"
        prevLabel="◀"
        formatMonthYear={(locale, date) =>`${date.toLocaleDateString(locale, { month: 'short' })} ${date.getFullYear()}` }
      />
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{ 
          backdropFilter: "blur(2px)", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="modal-content" 
              style={{ 
                width: "50%",
                backgroundColor: "white",
                padding: "16px"
                }}>
          <h2 id="modal-title">NFT 상세 정보</h2>
          {selectedNFT && (
            <div id="modal-description">
              <Typography variant="h5">{selectedNFT.name}</Typography>
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
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  style={{ width: "200px" }}
                />
              </Box>
              <Typography variant="h8" sx={{ mt: "3px" }}>
                {selectedNFT.description}
              </Typography>
              <p></p>
              <Box sx={{ display: "flex" }}>
                <Typography fontSize="small">
                  Contract Address :
                </Typography>
                <Typography
                  variant="h10"
                  color="blue"
                  fontSize="small"
                  sx={{ cursor: "pointer", ml: "4px" }}
                  onClick={() => handleAddress(selectedNFT.contractAddress)}
                >
                  {selectedNFT.contractAddress.slice(0, 6)}...
                  {selectedNFT.contractAddress.slice(
                    selectedNFT.contractAddress.length - 5,
                    selectedNFT.contractAddress.length - 1
                  )}
                </Typography>
              </Box>
              <Box sx={{ mt: "10px", display: "flex" }}>
                <Typography fontSize="small">Token ID : </Typography>
                <Typography fontSize="small" sx={{ ml: "4px" }}>
                  {selectedNFT.tokenId}
                </Typography>
              </Box>
              <Box sx={{ mt: "10px", display: "flex" }}>
                <Typography fontSize="small">Chain : </Typography>
                <Typography fontSize="small" sx={{ ml: "4px" }}>
                  {selectedNFT.chain}
                </Typography>
              </Box>
              <Box sx={{ mt: "10px", display: "flex" }}>
                <Typography fontSize="small">
                  Last Updated :{" "}
                </Typography>
                <Typography fontSize="small" sx={{ ml: "4px" }}>
                  {selectedNFT.createdAt}
                </Typography>
              </Box>
              <Box sx={{ mt: "10px", display: "flex" }}>
                <Typography fontSize="small">Transaction : </Typography>
                <Typography
                  variant="h10"
                  color="blue"
                  fontSize="small"
                  sx={{ cursor: "pointer", ml: "4px" }}
                  onClick={() => handleTx(selectedNFT.transactionHash)}
                >
                  {selectedNFT.transactionHash.slice(0, 6)}...
                  {selectedNFT.transactionHash.slice(
                    selectedNFT.transactionHash.length - 5,
                    selectedNFT.transactionHash.length - 1
                  )}
                </Typography>
              </Box>

            </div>
          )}
        </div>
      </Modal>
    </Box>

  );

}