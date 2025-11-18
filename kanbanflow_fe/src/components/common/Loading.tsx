import { Spin } from 'antd'

interface LoadingProps {
  size?: 'small' | 'default' | 'large'
  fullScreen?: boolean
  tip?: string
}

export default function Loading({ size = 'default', fullScreen = false, tip }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <Spin size={size} tip={tip} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Spin size={size} tip={tip} />
    </div>
  )
}