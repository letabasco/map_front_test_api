import axios from 'axios';

// 경찰서 위치 검색 및 마커 관리를 위한 서비스
class PoliceService {
    constructor() {
        this.apiKey = process.env.REACT_APP_KAKAO_API_KEY; // 환경 변수 사용
        this.isInitialized = false; // 카카오 API 초기화 체크
    }

    // 카카오 API 로드
    loadKakaoAPI() {
        return new Promise((resolve, reject) => {
            if (this.isInitialized) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${this.apiKey}&libraries=services`;

            script.onload = () => {
                this.isInitialized = true;
                resolve();
            };

            script.onerror = (error) => {
                reject(new Error('Kakao 지도 API 로드 실패'));
            };

            document.head.appendChild(script);
        });
    }

    // 현재 위치를 기반으로 경찰서 검색 실행
    async searchPoliceStations() {
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;

            const url = 'https://dapi.kakao.com/v2/local/search/category.json';
            const config = {
                headers: {
                    Authorization: `KakaoAK ${this.apiKey}`,
                },
                params: {
                    category_group_code: 'PO3', // 공공기관 카테고리
                    x: longitude, // 현재 위치의 경도
                    y: latitude, // 현재 위치의 위도
                    radius: 5000, // 검색 반경 (미터)
                },
            };

            const response = await axios.get(url, config);

            const keywords = ['경찰서', '지구대', '파출소'];
            return response.data.documents
                .filter(place => keywords.some(keyword => place.place_name.includes(keyword)))
                .map(place => ({
                    id: place.id,
                    name: place.place_name,
                    position: {
                        lat: parseFloat(place.y),
                        lng: parseFloat(place.x),
                    },
                    address: place.address_name,
                    phone: place.phone,
                    placeUrl: place.place_url,
                }));
        } catch (error) {
            console.error('경찰서 검색 실패:', error);
            return [];
        }
    }

    // 현재 위치 가져오기
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve(position),
                    (error) => reject(error),
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            } else {
                reject(new Error('Geolocation을 지원하지 않습니다.'));
            }
        });
    }
}

export const policeService = new PoliceService(); 