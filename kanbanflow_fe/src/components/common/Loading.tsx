import { Spin } from 'antd'

interface LoadingProps {
  size?: 'small' | 'default' | 'large'
  fullScreen?: boolean
  tip?: string
}

export default function Loading({ size = 'default', fullScreen = false, tip }: LoadingProps) {
  
  // 1. SỬA TRƯỜNG HỢP FULLSCREEN
  if (fullScreen) {
    // Dùng prop 'fullscreen' có sẵn của <Spin>
    // Nó sẽ tự động căn giữa, tạo lớp phủ và hiển thị tip bên dưới
    return <Spin size={size} tip={tip} fullscreen />;
  }

  // 2. SỬA TRƯỜNG HỢP CƠ BẢN (KHÔNG FULLSCREEN)
  return (
    // Dùng flex-col để 'tip' nằm bên dưới 'Spin'
    <div className="flex flex-col items-center justify-center py-12">
      
      {/* Không truyền 'tip' vào <Spin> nữa */}
      <Spin size={size} /> 
      
      {/* Tự render 'tip' ở bên ngoài nếu nó tồn tại */}
      {tip && <div className="mt-2 text-gray-500">{tip}</div>}
      
    </div>
  );
}