import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

export default function RadarChart({ scores, size = 200 }) {
  const labels = Object.keys(scores);
  const values = Object.values(scores);
  const center = size / 2;
  const radius = size * 0.37; // 描画半径
  const pointCount = labels.length;

  const angle = (2 * Math.PI) / pointCount;

  const getPoint = (value, index, scale = 1) => {
    const x = center + Math.sin(index * angle) * radius * (value / 5) * scale;
    const y = center - Math.cos(index * angle) * radius * (value / 5) * scale;
    return `${x},${y}`;
  };

  const getLabelPoint = (index) => {
    const x = center + Math.sin(index * angle) * (radius + 12);
    const y = center - Math.cos(index * angle) * (radius + 12);
    return { x, y };
  };

  const polygonPoints = values.map((v, i) => getPoint(v, i)).join(' ');
  const outerPoints = labels.map((_, i) => getPoint(5, i)).join(' ');

  return (
    <View>
      <Svg width={size} height={size}>
        {/* レーダーの外枠 */}
        <Polygon
          points={outerPoints}
          fill="none"
          stroke="#bbb"
          strokeWidth={1}
        />

        {/* 軸線 */}
        {labels.map((_, i) => {
          const x = center + Math.sin(i * angle) * radius;
          const y = center - Math.cos(i * angle) * radius;
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#ccc"
              strokeWidth={1}
            />
          );
        })}

        {/* 評価値ポリゴン */}
        <Polygon
          points={polygonPoints}
          fill="#6f4e37"
          fillOpacity={0.3}
          stroke="#6f4e37"
          strokeWidth={2}
        />

        {/* ラベル */}
        {labels.map((label, i) => {
          const { x, y } = getLabelPoint(i);
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              fill="#333"
              fontSize={size < 150 ? 10 : 12}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
