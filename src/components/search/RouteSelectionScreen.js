import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchScreen from './SearchScreen';
import MapService from '../map/MapService';
import RouteService from '../map/RouteService';
import RouteInfoPanel from '../map/s_bt';
import './RouteSelectionScreen.css';

const RouteSelectionScreen = ({ destination, onBack }) => {
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [routeType, setRouteType] = useState('normal');
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);
  const mapServiceRef = useRef(null);
  const routeServiceRef = useRef(null);

  // drawRoute를 useCallback으로 감싸서 메모이제이션
  const drawRoute = useCallback(async () => {
    if (!routeServiceRef.current) return;
    
    try {
      const result = await routeServiceRef.current.drawRoute(
        startLocation?.coords,
        destination?.coords,
        routeType
      );
      setRouteInfo(result);
    } catch (error) {
      console.error('경로 그리기 실패:', error);
      setRouteInfo({ error: '경로를 찾을 수 없습니다.' });
    }
  }, [startLocation, destination, routeType]);

  // 출발지와 도착지가 모두 있을 때만 지도 초기화
  useEffect(() => {
    if (mapRef.current && startLocation && destination) {
      mapServiceRef.current = new MapService(mapRef.current);
      routeServiceRef.current = new RouteService(mapServiceRef.current.getMapInstance());
      
      drawRoute();
    }
  }, [startLocation, destination, routeType, drawRoute]);

  // 거리 포맷팅
  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  const handleStartLocationClick = () => {
    setIsSearchingStart(true);
  };

  const handleDestinationClick = () => {
    setIsSearchingDestination(true);
  };

  const handleStartLocationSelect = (location) => {
    setStartLocation(location);
    setIsSearchingStart(false);
  };

  if (isSearchingDestination) {
    onBack();
    return null;
  }

  if (isSearchingStart) {
    return (
      <SearchScreen 
        onClose={() => setIsSearchingStart(false)}
        onNavigate={handleStartLocationSelect}
        isStartLocation={true}
      />
    );
  }

  return (
    <div className="route-selection-screen">
      <div className="route-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>
            ✕
          </button>
        </div>
        <div className="location-inputs">
          <div 
            className="input-row clickable"
            onClick={handleStartLocationClick}
          >
            <span className="location-icon">⬆️</span>
            <input 
              type="text" 
              placeholder="출발지 입력" 
              className="location-input"
              value={startLocation ? startLocation.name : ''}
              readOnly
            />
          </div>
          <div 
            className="input-row clickable"
            onClick={handleDestinationClick}
          >
            <span className="location-icon">⬇️</span>
            <input 
              type="text" 
              value={destination.name}
              className="location-input"
              readOnly
            />
          </div>
        </div>
      </div>
      
      <div className="transport-tabs">
        <button 
          className={`transport-tab ${routeType === 'normal' ? 'active' : ''}`}
          onClick={() => setRouteType('normal')}
        >
          <span className="tab-icon">🚶</span>
          <span className="tab-text">일반</span>
        </button>
        <button 
          className={`transport-tab ${routeType === 'safe' ? 'active' : ''}`}
          onClick={() => setRouteType('safe')}
        >
          <span className="tab-icon">🛡️</span>
          <span className="tab-text">안전</span>
        </button>
      </div>

      {startLocation && destination && (
        <>
          <div className="map-container" ref={mapRef}></div>
          <RouteInfoPanel
            routeInfo={routeInfo}
            routeType={routeType}
            formatDistance={formatDistance}
            formatTime={formatTime}
          />
        </>
      )}
    </div>
  );
};

export default RouteSelectionScreen;