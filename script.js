let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.51376, lng: 126.9864 }, // 기본 위치: 서울
    zoom: 12,
  });

  // 지도 클릭 이벤트
  map.addListener("click", (event) => {
    const clickedLocation = event.latLng;
    console.log("지도 클릭:", clickedLocation.toString());

    // 지도 클릭 시 마커 추가
    const marker = new google.maps.Marker({
      position: clickedLocation,
      map: map,
      title: "클릭된 위치",
    });

    // 마커를 배열에 저장
    markers.push(marker);

    // 클릭한 위치 근처 장소 검색
    findPlaceByLocation(clickedLocation);
  });
}
window.initMap = initMap;

function searchPlace() {
  if (!map) {
    console.error("지도(map)가 아직 초기화되지 않았습니다.");
    return;
  }

  const input = document.getElementById("place-input").value;
  if (!input) {
    alert("검색어를 입력해주세요.");
    return;
  }

  const service = new google.maps.places.PlacesService(map);
  const request = {
    query: input,
    fields: ["name", "geometry", "formatted_address", "rating"],
  };37.51376, 126.9864

  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      const placesList = document.getElementById("places-list");
      placesList.innerHTML = "";

      results.forEach((place, index) => {
        // 검색 결과에 마커 추가
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        });

        //생성된 마커를 배열에 저장
        markers.push(marker);

        // 명소 리스트에 추가
        const placeItem = document.createElement("div");
        placeItem.classList.add("place-item");
        placeItem.innerHTML = `
          <strong>${index + 1}. ${place.name}</strong><br>
          ${place.formatted_address}<br>
          <span>Rating: ${place.rating || "N/A"}</span>
        `;
        placeItem.onclick = () => {
          console.log(`리스트 항목클릭 ${place.name}`);
          map.setCenter(place.geometry.location);
          map.setZoom(15); // 해당 장소를 중심으로 줌인
          getPlaceDetails(place.place_id);
          
        };
        placesList.appendChild(placeItem);
      });

      // 첫 번째 결과를 지도 중심으로 설정
      map.setCenter(results[0].geometry.location);
    } else {
      console.error("장소 검색 실패:", status);
      alert("검색 결과가 없습니다. 다른 검색어를 입력해 보세요.");
    }
  });
}

function getPlaceDetails(placeId) {
  const service = new google.maps.places.PlacesService(map);

  const request = {
    placeId: placeId,
    fields: [
      "name",
      "formatted_address",
      "formatted_phone_number",
      "website",
      "opening_hours",
      "reviews",
    ],
  };

  service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
      // 모달창 열기
      const modal = document.getElementById("modal");
      const modalDetails = document.getElementById("modal-details");
      modal.style.display = "block";

      // 모달창에 명소 정보 표시
      modalDetails.innerHTML = `
        <h4>${place.name}</h4>
        <p><strong>주소:</strong> ${place.formatted_address}</p>
        <p><strong>전화번호:</strong> ${place.formatted_phone_number || "정보 없음"}</p>
        <p><strong>웹사이트:</strong> <a href="${place.website}" target="_blank">${place.website || "정보 없음"}</a></p>
        <p><strong>영업시간:</strong><br> ${
          place.opening_hours
            ? place.opening_hours.weekday_text.join("<br>")
            : "정보 없음"
        }</p>
        <h5>리뷰:</h5>
        ${
          place.reviews
            ? place.reviews
                .slice(0, 3)
                .map(
                  (review) =>
                    `<p><strong>${review.author_name}:</strong> ${review.text}</p>`
                )
                .join("")
            : "리뷰 없음"
        }
      `;

      // 닫기 버튼 동작
      const closeBtn = document.querySelector(".close-btn");
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };

      // 모달창 외부 클릭 시 닫기
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };
    } else {
      console.error("세부 정보를 가져올 수 없습니다:", status);
      alert("명소 정보를 가져오는 데 실패했습니다.");
    }
  });
}

function findPlaceByLocation(location) {
  const service = new google.maps.places.PlacesService(map);

  const request = {
    location: location,
    radius: 500, // 반경 500미터 내 장소 검색
    type: ["restaurant", "cafe", "tourist_attraction"],
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      console.log("근처 장소:", results);

      getPlaceDetails(results[0].place_id);

      // 검색된 첫 번째 장소에 마커 추가
      const marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        title: results[0].name,
      });

      // 마커를 배열에 저장
      markers.push(marker);

      // 지도 중심 및 줌 레벨 설정
      map.setCenter(results[0].geometry.location);
      map.setZoom(20);

      console.log(`클릭한 위치에서 가까운 장소: ${results[0].name}`);
    } else {
      alert("해당 위치 주변에 유효한 장소가 없습니다.");
    }
  });
}

function clearMarkers() {
  markers.forEach((marker) => {
    marker.setMap(null); // 지도에서 마커 제거
  });
  markers = []; // 배열 초기화
  console.log("모든 마커가 제거되었습니다.");
}

window.searchPlace = searchPlace;  // 전역으로 설정
