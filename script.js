let map;

function initMap() {
  const mapOptions = {
    center: { lat: 37.7749, lng: -122.4194 }, // 기본 위치: 샌프란시스코
    zoom: 12,
  };
  // 지도 초기화
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}
window.initMap = initMap;  // 전역으로 설정

function searchPlace() {
  // map 객체가 제대로 초기화되었는지 확인
  if (!map) {
    console.error("지도(map)가 아직 초기화되지 않았습니다.");
    return;
  }

  const input = document.getElementById("place-input").value;
  if (!input) {
    alert("검색어를 입력해주세요.");
    return;
  }

  // Google PlacesService를 사용하여 검색 요청을 만듭니다.
  const service = new google.maps.places.PlacesService(map);
  const request = {
    query: input,
    fields: ["name", "geometry", "formatted_address", "rating"],
  };

  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      // 리스트 컨테이너 초기화
      const placesList = document.getElementById("places-list");
      placesList.innerHTML = "";

      results.forEach((place, index) => {
        // 검색 결과에 마커 추가
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        });

        // 명소 리스트에 추가
        const placeItem = document.createElement("div");
        placeItem.classList.add("place-item");
        placeItem.innerHTML = `
          <strong>${index + 1}. ${place.name}</strong><br>
          ${place.formatted_address}<br>
          <span>Rating: ${place.rating || "N/A"}</span>
        `;
        placeItem.onclick = () => {
          map.setCenter(place.geometry.location);
          map.setZoom(15); // 해당 장소를 중심으로 줌인
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
window.searchPlace = searchPlace;  // 전역으로 설정
