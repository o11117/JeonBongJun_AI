import React from 'react';

function IndexComponent({ data }) {
    if (!data) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#999' }}>데이터 로딩 중...</div>
            </div>
        );
    }

    const { value, changeValue, changeRate, chartData } = data;
    const isPositive = changeValue >= 0;
    const primaryColor = isPositive ? '#dc2626' : '#2563eb';
    const gradientId = `gradient-${isPositive ? 'up' : 'down'}-${Math.random()}`;

    const renderChart = () => {
        if (!chartData || chartData.length === 0) {
            return (
                <div style={{
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    fontSize: '13px'
                }}>
                    차트 데이터 없음
                </div>
            );
        }

        const width = 280;
        const height = 100;
        const paddingLeft = 10;
        const paddingRight = 10;
        const paddingTop = 10;
        const paddingBottom = 10;

        const values = chartData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // 라인 좌표 생성
        const points = chartData.map((d, i) => {
            const x = paddingLeft + (i / Math.max(chartData.length - 1, 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
            return { x, y };
        });

        const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
        
        // 그라디언트 영역을 위한 패스 생성
        const areaPath = `
            M ${paddingLeft},${height - paddingBottom}
            L ${points[0].x},${points[0].y}
            ${points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}
            L ${points[points.length - 1].x},${height - paddingBottom}
            Z
        `;

        return (
            <div style={{ marginTop: '16px' }}>
                <svg
                    width="100%"
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ display: 'block' }}
                >
                    {/* 그라디언트 정의 */}
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.01" />
                        </linearGradient>
                    </defs>

                    {/* 그라디언트 영역 */}
                    <path
                        d={areaPath}
                        fill={`url(#${gradientId})`}
                    />

                    {/* 메인 라인 */}
                    <polyline
                        points={linePoints}
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {/* 마지막 점만 표시 */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="4"
                        fill={primaryColor}
                    />
                    
                    {/* 마지막 점 강조 링 */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="7"
                        fill={primaryColor}
                        opacity="0.2"
                    />
                </svg>

                <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginTop: '8px',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    최근 7일 추이
                </div>
            </div>
        );
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            transition: 'all 0.2s ease'
        }}>
            {/* 지수 값 */}
            <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '6px',
                letterSpacing: '-0.5px'
            }}>
                {value?.toLocaleString()}
            </div>

            {/* 등락 정보 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
            }}>
                <span style={{
                    fontSize: '18px',
                    color: primaryColor,
                    fontWeight: '600'
                }}>
                    {changeValue > 0 ? '▲' : '▼'} {Math.abs(changeValue)?.toFixed(2)}
                </span>
                <span style={{
                    fontSize: '16px',
                    color: primaryColor,
                    fontWeight: '600',
                    backgroundColor: isPositive ? '#fee2e2' : '#dbeafe',
                    padding: '2px 8px',
                    borderRadius: '6px'
                }}>
                    {changeRate > 0 ? '+' : ''}{changeRate?.toFixed(2)}%
                </span>
            </div>

            {/* 차트 */}
            {renderChart()}
        </div>
    );
}

export default IndexComponent;