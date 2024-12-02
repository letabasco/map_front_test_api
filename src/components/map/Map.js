import React, { useState } from 'react';
import MapComponent from './MapComponent';
import SearchScreen from '../search/SearchScreen';
import './Map.css';
import { policeService } from '../../services/PoliceService';

const Map = ({ selectedMode, isSearchOpen, setIsSearchOpen, onNavigate }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [markers, setMarkers] = useState([]);

  const handlePoliceButtonClick = async () => {
    if (activeButton === '경찰서') {
      // 동일한 버튼이 다시 눌렸을 때 마커 제거
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      setActiveButton(null);
      return;
    }

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    setActiveButton('경찰서');

    try {
      await policeService.loadKakaoAPI();
      const policeStations = await policeService.searchPoliceStations();
      const newMarkers = policeStations.map(station => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(station.position.lat, station.position.lng),
          map: window.mapInstance, // mapInstance는 MapComponent에서 가져와야 함
          title: station.name,
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding:10px;min-width:200px;">
              <h4>${station.name}</h4>
              <p>${station.address}</p>
              ${station.phone ? `<p>전화: ${station.phone}</p>` : ''}
              <a href="${station.placeUrl}" target="_blank">상세보기</a>
            </div>
          `,
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          infoWindow.open(window.mapInstance, marker);
        });

        return marker;
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error('경찰서 검색 중 오류 발생:', error);
    }
  };

  const handleNavigate = (destination) => {
    onNavigate(destination);
  };

  const filterButtons = {
    '일반': [
      { icon: '🏗️', text: '공사현장' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '⚠️', text: '범죄주의구간' },
    ],
    '여성': [
      { icon: '🚨', text: '안전비상벨' },
      { icon: '📹', text: 'CCTV' },
      { icon: '⚠️', text: '범죄주의구간' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '🏗️', text: '공사현장' },
    ],
    '노약자': [
      { icon: '🚇', text: '지하철역 엘레베이터' },
      { icon: '💊', text: '심야약국' },
      { icon: '🔌', text: '휠체어 충전소' },
      { icon: '🏥', text: '복지시설' },
      { icon: '⚠️', text: '범죄주의구간' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '🏗️', text: '공사현장' },
    ],
  };

  return (
    <div className="map-container">
      {isSearchOpen ? (
        <SearchScreen 
          onClose={() => setIsSearchOpen(false)} 
          onNavigate={handleNavigate}
        />
      ) : (
        <>
          {/* 헤더 */}
          <div className="header">
            <div className="logo">
              <img 
                src="/images/search_bar/mapspicy.png" 
                alt="map spicy" 
                className="logo-image"
              />
            </div>
            <button className="menu-button">≡</button>
          </div>

          {/* 검색바 */}
          <div 
            className="search-bar"
            onClick={() => setIsSearchOpen(true)}
          >
            <img 
              src="/images/search_bar/search.svg" 
              alt="검색" 
              className="search-icon"
            />
            <input 
              type="text" 
              placeholder="장소, 주소 검색" 
              className="search-input" 
              readOnly
            />
            <img 
              src="/images/search_bar/mike.svg" 
              alt="음성 검색" 
              className="voice-icon"
            />
            <img 
              src="/images/search_bar/menu.svg" 
              alt="메뉴" 
              className="menu-icon"
            />
          </div>
          
          {/* 필터 버튼 */}
          <div className="filter-buttons-container">
            <div className="filter-buttons-scroll">
              {filterButtons[selectedMode].map((button, index) => (
                <button 
                  key={index} 
                  className={`filter-button ${activeButton === button.text ? 'active' : ''}`}
                  onClick={() => {
                    if (button.text === '경찰서') {
                      handlePoliceButtonClick();
                    }
                  }}
                >
                  <span className="filter-button-icon">{button.icon}</span>
                  <span className="filter-button-text">{button.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 지도 컴포넌트 */}
          <div className="map-component-container">
            <MapComponent />
          </div>
        </>
      )}
    </div>
  );
};

export default Map;