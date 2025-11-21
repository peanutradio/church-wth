import React from 'react';
import { MapPin, Car, Bus, Train } from 'lucide-react';

const Location = () => {
    return (
        <section id="location" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">찾아오시는 길</h2>
                <p className="text-center text-gray-600 mb-12">분당선 서울숲역에서 도보 5분 이내로 찾아오실 수 있습니다</p>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Map Area */}
                    <div className="bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] relative shadow-lg">
                        <iframe
                            src="https://www.google.com/maps?q=갤러리아포레+서울숲,서울특별시+성동구+서울숲2길+32-14&output=embed&z=17"
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '400px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="갤러리아포레몰 위치"
                        ></iframe>
                    </div>

                    {/* Info Area */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                주소 (Address)
                            </h3>
                            <p className="text-gray-600 ml-8">
                                서울 성동구 서울숲2길 32-14 갤러리아포레몰 B1 101호 드림센터
                            </p>
                            <div className="mt-4 ml-8 bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                <p className="font-bold mb-1">💡 오시는 방법</p>
                                <p>중앙 엘리베이터와 에스컬레이터를 통해 <span className="font-bold">지하 1층</span>으로 오세요.</p>
                                <p>중식당(서우)와 키즈카페(플레이즈라운지) 사이 통로로 끝까지 오시면 됩니다.</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                                <Car className="w-6 h-6 text-blue-600" />
                                주차 (Parking)
                            </h3>
                            <ul className="text-gray-600 ml-8 space-y-2 list-disc">
                                <li>차량 이용시 주차는 상가동 <span className="font-bold text-gray-900">지하 3-7층을 이용</span>해주세요.</li>
                                <li>주일 예배를 비롯한 <span className="font-bold text-gray-900">공예배 시 무료주차를 지원</span>합니다.</li>
                                <li>입구에서 안내표시를 따라 주차해주세요.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900">
                                <Bus className="w-6 h-6 text-blue-600" />
                                대중교통 (Public Transport)
                            </h3>
                            <div className="ml-8 space-y-4">
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">지하철 (Subway)</p>
                                    <p className="text-gray-600">2호선 뚝섬역 8번 출구 (도보 7분)</p>
                                    <p className="text-gray-600">수인분당선 서울숲역 5번 출구 (도보 3분)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Location;
