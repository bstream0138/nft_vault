import React, { useEffect, useState } from "react";

// MUI css
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";

// Recoil
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressState } from "../recoil/account.js";
import { loadingState } from "../recoil/loading.js";

// Api
import { getNftsByAddress } from "../APIs/kasCall.js";

// react 캘린더 라이브러리 import
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import "./NFTs.css";

export default function NFTs() {

  const addresses = [
    "0x0de9e664f2f8f773b98e42a26a59fffba9a3e2be",
    "0x5D674b20c73CCf59e7aFDc3fDC5427f59C821cea",
    "0x111B2F59D47f53572E41c3c78140625DA425E23c",
    "0xFcCe29a8503b1e66FAfDeB76157EcEbfFCf0309b",
    "0x812973084D6fBd58D7f440eeFA98C49677894A94",
    "0xd167Dd9b2B1587532b23BE52a89cfa08614C92Fd",
    "0x180A008a563eFD8aD0d1025090F7B2Fc2CCCf1b3"
  ];
  
  const { address } = useRecoilValue(addressState);
  const isLoading = useSetRecoilState(loadingState);
  const [nfts, setNfts] = useState([]);
  const [isCardExpanded, setIsCardExpanded] = useState([]);
  
  // 캘린더뷰의 시작일자는 수업 시작일자인 10월 18일로, 10월 18일 시작하려면 9월 18일로 셋팅
  const [activeStartDate, setActiveStartDate] = useState(new Date(2023, 9, 10));

  // NFT를 날짜별로 정리
  const [calendarNfts, setCalendarNfts] = useState({});

  // Modal 관련 변수
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // 출석부에서 표시하고 있는 address 변수
  const [selectedAddress, setSelectedAddress] = useState(address);

  // 출석률 계산
  const [totalDays] = useState(19);
  const [participationDays, setParticipationDays] = useState(0);


  const getNfts = async () => {
    isLoading({ isLoading: true });

    const nfts = await getNftsByAddress(selectedAddress);
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
    let count = 0;
    console.log(`nfts: ${nfts.length}`);
    
    nfts
    .filter((nft) => nft.description.includes("출석"))
    .forEach((nft) => {
      const createdAt = new Date(nft.createdAt).toISOString().split('T')[0]
      //console.log(`nft's createdAt: ${createdAt}`);

      // createdAt에 해당하는 날짜가 없다면 배열 생성
      if (!nftByDate[createdAt]) {
        nftByDate[createdAt] = [];
        // 참여일수 증가
        count++;
      }

      nftByDate[createdAt].push(nft);
    });

    setParticipationDays(count);

    // 키 개수 확인
    console.log(`nftByDate: ${Object.keys(nftByDate).length}`);
    console.log(`참여일수: ${count}`);
    console.log(`출석률: ${(count / totalDays) * 100}%`);
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

  // 지갑 주소 변경 시 상태 업데이트
  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value); 
  };

  useEffect(() => {
    getNfts();    // eslint-disable-next-line
  }, [selectedAddress]);

  // 날짜별로 정리하고, 동일 날짜 NFT는 생성시간 가장 빠른 것만
  useEffect(() => {
    const processedNfts = processNFTsForCalendar(nfts);
    setCalendarNfts(processedNfts);
  }, [nfts]);

  // 캘린더에서 날짜가 변경될 때
  const onActiveStartDateChange = ({ activeStartDate }) => {
    setActiveStartDate(activeStartDate);
  };

  // 캘린더에서 날짜를 클릭했을 때
  const onDayClick = (value) => {
    const dateKey = value.toISOString().split('T')[0];
    const nft = nfts.find((nft) => new Date(nft.createdAt).toDateString() === dateKey);
    if(nft) {
      openModal(nft);
    }
  };

  // 캘린더 타일을 렌더링하는 함수
  const renderCalendarTile = ({ date }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayNfts = calendarNfts[dateKey] || [];

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
      <FormControl sx={{ backgroundColor: '#e8f5f9', width: '100%' }}>
        <Box>
          <strong> 수강생 지갑 주소 선택 : {" "} </strong>
          <Select
            value={selectedAddress}
            onChange={handleAddressChange}
            sx={{ backgroundColor: 'white' }}
          >
            {addresses.map((addr) => (
              <MenuItem key={addr} value={addr}>
                {addr}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </FormControl>
      <p></p>

      <div className="calendar-message" style={{ textAlign: "right", fontSize: "90%" }}>
        출석도장을 클릭하면 상세 내용을 확인하실 수 있습니다.
      </div>
      <p></p>

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
        locale={ko}
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
          <h2 id="modal-title" style={{ textAlign: "center" }}>NFT 상세 정보</h2>
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
              <Typography variant="h8" sx={{ mt: "3px" }} >
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