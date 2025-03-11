export const ROUTE_COLORS= [
  '#FF0000', // 빨강
  '#00FF00', // 밝은 초록
  '#0000FF', // 파랑
  '#FF00FF', // 마젠타
  '#00FFFF', // 시안
  '#FF8000', // 주황
  '#FF0080', // 핫핑크
  '#8000FF', // 보라
  '#0080FF', // 하늘색
  '#80FF00', // 라임
  '#FFB366', // 연한 주황
  '#FF66B3', // 연한 핑크
  '#B366FF', // 연한 보라
  '#66B3FF', // 연한 하늘
  '#B3FF66', // 연한 라임
  '#FF3333', // 밝은 빨강
  '#33FF33', // 밝은 초록
  '#3333FF', // 밝은 파랑
  '#FF33FF', // 밝은 마젠타
  '#33FFFF', // 밝은 시안
  '#CC6600', // 갈색
  '#CC0066', // 진한 핑크
  '#6600CC', // 진한 보라
  '#0066CC', // 진한 파랑
  '#66CC00', // 진한 초록
  '#FF99CC', // 파스텔 핑크
  '#CC99FF', // 파스텔 보라
  '#99CCFF', // 파스텔 블루
  '#CCFF99', // 파스텔 그린
  '#FFCC99', // 파스텔 오렌지
  '#990000', // 어두운 빨강
  '#009900', // 어두운 초록
  '#000099', // 어두운 파랑
  '#990099', // 어두운 마젠타
  '#009999', // 어두운 시안
  '#E6B800', // 골드
  '#E68A00', // 황토색
  '#E600E6', // 선명한 보라
  '#00E6E6', // 선명한 시안
  '#E6E600', // 노랑
  '#8B4513', // 새들브라운
  '#4B0082', // 인디고
  '#556B2F', // 다크올리브그린
  '#8B008B', // 다크마젠타
  '#2F4F4F', // 다크슬레이트그레이
  '#DAA520', // 골든로드
  '#9932CC', // 다크오키드
  '#8FBC8F', // 다크씨그린
  '#E9967A', // 다크새먼
  '#9400D3'  // 다크바이올렛
]

export function getRouteColor(index) {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

// export function adjustColor(color, factor) {
//     // hex to rgb
//     const r = parseInt(color.slice(0,2), 16);
//     const g = parseInt(color.slice(2,2), 16);
//     const b = parseInt(color.slice(4,2), 16);

//     const brightenR = Math.min(255, r * factor);
//     const brightenG = Math.min(255, g * factor);
//     const brightenB = Math.min(255, b * factor);

//     return (
//         '#' + 
//         [brightenR, brightenG, brightenB]
//         .map(c => Math.round(c).toString(16).padStart(2, '0'))
//         .join('')
//     )
    
// }
